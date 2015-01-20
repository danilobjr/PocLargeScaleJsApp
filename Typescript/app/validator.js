function validator(view) {
    var _view = view;
    var api = {
        formIsValid: formIsValid,
        selectedItemsTableIsFull: selectedItemsTableIsFull
    };
    return api;
    function formIsValid() {
        if (nameFieldIsEmpty()) {
            return false;
        }
        if (noneItemIsSelected()) {
            return false;
        }
        if (numberOfSelectedItemsIsGraterThan50()) {
            return false;
        }
        amplify.publish('validation-formIsValid');
        return true;
    }
    ;
    function nameFieldIsEmpty() {
        var nameFieldIsEmpty = !_view.getNameFieldValue();
        if (nameFieldIsEmpty) {
            amplify.publish('validation-nameIsRequired');
            return true;
        }
        return false;
    }
    function noneItemIsSelected() {
        var noneItemIsSelected = _view.tables.selectedItems.getNodes().length == 0;
        if (noneItemIsSelected) {
            amplify.publish('validation-mustHaveAtLeastOneItemSelected');
            return true;
        }
        return false;
    }
    function numberOfSelectedItemsIsGraterThan50() {
        var numberOfSelectedItemsIsGraterThan50 = _view.tables.selectedItems.getNodes().length > 50;
        if (numberOfSelectedItemsIsGraterThan50) {
            amplify.publish('validation-maximumNumberOfSelectedItemsIs50');
            return true;
        }
        return false;
    }
    function selectedItemsTableIsFull() {
        var selectedItemsTableIsFull = _view.tables.selectedItems.getNodes().length === 50;
        if (selectedItemsTableIsFull) {
            amplify.publish('validation-maximumNumberOfSelectedItemsIs50');
            return true;
        }
        return false;
    }
}
