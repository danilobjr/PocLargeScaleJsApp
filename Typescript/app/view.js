function view(dataTablesFactory, selectableTableFactory, reorderableTableFactory) {
    var _form = $('form');
    var _nameField = $('input[name=name]');
    var _addItemBtn = $('#addItemBtn');
    var _removeItemBtn = $('#removeItemBtn');
    var _moveRowUpBtn = $('#moveRowUpBtn');
    var _moveRowDownBtn = $('#moveRowDownBtn');
    var _validationMessageContainer = $('.validation-message-container');
    var _closeBtn = _validationMessageContainer.find('.close');
    var _dataTablesFactory = dataTablesFactory;
    var _selectableTableFactory = selectableTableFactory;
    var _reorderableTableFactory = reorderableTableFactory;
    var _api = {
        form: {
            onSubmit: onSubmit,
        },
        getNameFieldValue: getNameFieldValue,
        tables: {
            selectedItems: {},
            existingItems: {},
        },
        sideBySideCommands: {
            onAddItem: onAddItem,
            onRemoveItem: onRemoveItem,
            onMoveRowUp: onMoveRowUp,
            onMoveRowDown: onMoveRowDown
        },
        validationMessage: {
            showElementById: showElementById,
            hide: hideAllValidationElements,
            onDismiss: onDismissValidationMessage
        }
    };
    init();
    return _api;
    ////////////
    function init() {
        setupTables();
    }
    function setupTables() {
        var tableSetup = {
            //"bPaginate": false,
            "sPaginationType": "full_numbers",
            "bLengthChange": false,
            "bFilter": false,
            "bSort": false,
            "bInfo": false,
            "bAutoWidth": false,
            //"sDom": "<\"table-header\"fl>t<\"table-footer\"ip>"
            "sDom": "t<\"table-footer client-side-pagination\"ip>"
        };
        var selectedItemsSetup = tableSetup;
        // $.extend(
        // {},
        // {
        //     "aoColumns": [
        //         { "bVisible": false },
        //         null
        //     ]
        // },
        // setup);
        var selectedItemsTable = _dataTablesFactory().selector('#selectedItems').setup(selectedItemsSetup).init();
        _api.tables.selectedItems = $.extend({}, selectedItemsTable, selectableTableFactory().init(selectedItemsTable), reorderableTableFactory().init(selectedItemsTable));
        var existingItemsTable = _dataTablesFactory().selector('#existingItems').setup(tableSetup).init();
        _api.tables.existingItems = $.extend({}, existingItemsTable, selectableTableFactory().init(existingItemsTable));
    }
    function getNameFieldValue() {
        return _nameField.val();
    }
    function onSubmit(submitFunction) {
        _form.on('submit', submitFunction);
    }
    function onAddItem(addItemFunction) {
        _addItemBtn.on('click', addItemFunction);
    }
    function onRemoveItem(removeItemFunction) {
        _removeItemBtn.on('click', removeItemFunction);
    }
    function onDismissValidationMessage(dismissFunction) {
        _closeBtn.on('click', dismissFunction);
    }
    function onMoveRowUp(moveRowUpFunction) {
        _moveRowUpBtn.on('click', moveRowUpFunction);
    }
    function onMoveRowDown(moveRowDownFunction) {
        _moveRowDownBtn.on('click', moveRowDownFunction);
    }
    function showElementById(elementId) {
        var validationMessageSelector = '#' + elementId;
        _validationMessageContainer.removeClass('hidden');
        _validationMessageContainer.find(validationMessageSelector).removeClass('hidden');
    }
    function hideAllValidationElements() {
        _validationMessageContainer.addClass('hidden');
        _validationMessageContainer.find('.alert').addClass('hidden');
    }
}
//# sourceMappingURL=view.js.map