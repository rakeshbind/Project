@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'header table'
@Metadata.ignorePropagatedAnnotations: true
define root view entity zc_test_hdr as select from zpo_htable
//composition of target_data_source_name as _association_name
{
    key purchaseorder as Purchaseorder,
    creationdate as Creationdate,
    purchaseorderdate as Purchaseorderdate
    //_association_name // Make association public
}
