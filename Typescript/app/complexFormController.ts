
function complexFormController(view, validator, validationMessagesController) {

    var _view = view;
    var _validator = validator;
    var _validationMessagesController = validationMessagesController;

    var api = {
        submitForm: submitForm,
        addItem: addItem,
        removeItem: removeItem,
        showNameRequiredValidationMessage: showNameRequiredValidationMessage,
        showMustHaveAtLeastOneItemSelectedValidationMessage: showMustHaveAtLeastOneItemSelectedValidationMessage,
        showMaximumNumberOfSelectedItemsIs50ValidationMessage: showMaximumNumberOfSelectedItemsIs50ValidationMessage,
        hideValidationMessage: hideValidationMessage,
        registerSubscribers: registerSubscribers,
        unsubscribeAllTopics: unsubscribeAllTopics
    };

    init();

    return api;

    ///////////

    function init() {
        registerEvents();
        registerSubscribers();
    }

    function registerEvents() {
        _view.form.onSubmit(submitForm);
        _view.sideBySideCommands.onAddItem(addItem);
        _view.sideBySideCommands.onRemoveItem(removeItem);
        _view.sideBySideCommands.onMoveRowUp(moveRowUp);
        _view.sideBySideCommands.onMoveRowDown(moveRowDown);
    }

    function registerSubscribers() {
        amplify.subscribe('validation-formIsValid', hideValidationMessage);
        amplify.subscribe('validation-nameIsRequired', showNameRequiredValidationMessage);
        amplify.subscribe('validation-mustHaveAtLeastOneItemSelected', showMustHaveAtLeastOneItemSelectedValidationMessage);
        amplify.subscribe('validation-maximumNumberOfSelectedItemsIs50', showMaximumNumberOfSelectedItemsIs50ValidationMessage);

    }

    function unsubscribeAllTopics() {
        amplify.unsubscribe('validation-isValid', hideValidationMessage);
        amplify.unsubscribe('validation-nameIsRequired', showNameRequiredValidationMessage);
        amplify.unsubscribe('validation-mustHaveAtLeastOneItemSelected', showMustHaveAtLeastOneItemSelectedValidationMessage);
        amplify.unsubscribe('validation-maximumNumberOfSelectedItemsIs50', showMaximumNumberOfSelectedItemsIs50ValidationMessage);
    }

    function submitForm() {
        var isValid = _validator.formIsValid();

        if (!isValid) {
            return false;
        }
    }

    function addItem() {
        var selectedItemsTableIsItsMaximumCapacity = _validator.selectedItemsTableIsFull();

        if (!selectedItemsTableIsItsMaximumCapacity) {
            var selectedRow = _view.tables.existingItems.getSelectedRow();

            if (selectedRow) {
                var removedRow = _view.tables.existingItems.removeRow(selectedRow.index);
                _view.tables.selectedItems.addRow(removedRow.data, onAddRowToSelectedItemsTable);
            }
        }
    }

    function onAddRowToSelectedItemsTable(rowData, rows) {
        var order = rows.length + 1;
        rowData.unshift(order);

        return rowData;
    }

    function removeItem() {
        var selectedRow = _view.tables.selectedItems.getSelectedRow();

        if (selectedRow) {
            var removedRow = _view.tables.selectedItems.removeRow(selectedRow.index);
            _view.tables.existingItems.addRow(removedRow.data, onAddRowToExistingItemsTable);
        }
    }

    function onAddRowToExistingItemsTable(rowData) {
        rowData.shift();

        return rowData;
    }

    function moveRowUp() {
        var selectedRow = _view.tables.selectedItems.getSelectedRow();

        if (selectedRow) {
            _view.tables.selectedItems.moveRowUp(selectedRow.index);
        }
    }

    function moveRowDown() {
        var selectedRow = _view.tables.selectedItems.getSelectedRow();

        if (selectedRow) {
            _view.tables.selectedItems.moveRowDown(selectedRow.index);
        }
    }

    function showNameRequiredValidationMessage() {
        showValidationMessageFor('validation-nameIsRequired');
    }

    function showMustHaveAtLeastOneItemSelectedValidationMessage() {
        showValidationMessageFor('validation-mustHaveAtLeastOneItemSelected');
    }

    function showMaximumNumberOfSelectedItemsIs50ValidationMessage() {
        showValidationMessageFor('validation-maximumNumberOfSelectedItemsIs50');
    }

    function showValidationMessageFor(topic) {
        _validationMessagesController.showMessage(topic);
    }

    function hideValidationMessage() {
        _validationMessagesController.hideMessage();
    }
} 