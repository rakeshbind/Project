CLASS zcl_http_po DEFINITION
  PUBLIC
  CREATE PUBLIC .

  PUBLIC SECTION.
    INTERFACES if_http_service_extension .
  PROTECTED SECTION.
  PRIVATE SECTION.
ENDCLASS.




CLASS zcl_http_po IMPLEMENTATION.


  METHOD if_http_service_extension~handle_request.

    DATA: lv_method TYPE string.

    TYPES : ty_poheader TYPE zpo_htable,
            tt_poheader TYPE STANDARD TABLE OF ty_poheader WITH DEFAULT KEY.

    DATA: lt_data  TYPE tt_poheader,
          lt_data2 TYPE tt_poheader,
          ls_data  TYPE ty_poheader,
          ls_data2 TYPE ty_poheader.

    " Get HTTP method and JSON body
    lv_method = request->get_method( ).
    DATA(lv_json)   = request->get_text( ).

    " Only handle POST requests
    IF lv_method = 'POST'.

      " Parse JSON into internal table
      TRY.
          /ui2/cl_json=>deserialize(
            EXPORTING json = lv_json
            CHANGING  data = lt_data
          ).
        CATCH cx_root INTO DATA(lx_json).
          response->set_status( 400 ).
          response->set_text( 'Invalid JSON' ).
          RETURN.
      ENDTRY.

      " Append each row into DB
      LOOP AT lt_data INTO DATA(ls_row).

        " Save into DB table

        INSERT zpo_htable FROM @ls_row.

        " Agar record already exist kare to update karna ho to
        " MODIFY zpo_htable FROM ls_data.

        IF sy-subrc <> 0.
          " Error handling (optional)
          response->set_status( 500 ).
          response->set_text( |Failed to insert PO { ls_data-purchaseorder }| ).
          RETURN.
        ENDIF.

      ENDLOOP.

      response->set_status( 200 ).
      response->set_text( 'Data inserted successfully (append-only)' ).


    ELSEIF lv_method = 'GET'.

      " Select all records from table into lt_data1
      SELECT * FROM zpo_htable INTO TABLE @DATA(lt_data1).

      " Serialize table into JSON
      DATA(lv_json_out) = /ui2/cl_json=>serialize(
          data        = lt_data1
          pretty_name = abap_true
      ).

      " Set response
      response->set_status( 200 ).
      response->set_header_field(
          i_name  = 'Content-Type'
          i_value = 'application/json'
      ).
      response->set_text( lv_json_out ).

    ELSEIF lv_method = 'PUT'.

      TRY.
          /ui2/cl_json=>deserialize(
            EXPORTING json = lv_json
            CHANGING  data = lt_data
          ).
        CATCH cx_root INTO DATA(lx_jsons).
          response->set_status( 400 ).
          response->set_text( 'Invalid JSON' ).
          RETURN.
      ENDTRY.


      LOOP AT lt_data INTO DATA(wa_data).

        " Example: Update ZTABLE with JSON data
        UPDATE zpo_htable
          SET  creationdate = @wa_data-creationdate ,
              purchaseorderdate = @wa_data-purchaseorderdate

          WHERE purchaseorder = @wa_data-purchaseorder.

        IF sy-subrc = 0.
          " Successfully updated
        ELSE.
          " Record not found, maybe INSERT instead
          INSERT zpo_htable FROM @wa_data.
        ENDIF.

      ENDLOOP.

      COMMIT WORK.
      response->set_status( 200 ).
      response->set_text( 'Data updated successfully' ).

    ELSEIF lv_method = 'DELETE'.

      " Deserialize incoming JSON into lt_data (for delete keys)
      TRY.
          /ui2/cl_json=>deserialize(
            EXPORTING json = lv_json
            CHANGING  data = lt_data
          ).
        CATCH cx_root INTO DATA(lx_jsond).
          response->set_status( 400 ).
          response->set_text( 'Invalid JSON for DELETE' ).
          RETURN.
      ENDTRY.

      LOOP AT lt_data INTO DATA(wa_del).

        " Delete based on primary key (purchaseorder in this case)
        DELETE FROM zpo_htable
          WHERE purchaseorder = @wa_del-purchaseorder.

        IF sy-subrc = 0.
          " Successfully deleted
        ELSE.
          " Not found
          response->set_status( 404 ).
          response->set_text( |Record not found for PO { wa_del-purchaseorder }| ).
          RETURN.
        ENDIF.

      ENDLOOP.

      COMMIT WORK.
      response->set_status( 200 ).
      response->set_text( 'Data deleted successfully' ).




    ENDIF.


  ENDMETHOD.

ENDCLASS.
