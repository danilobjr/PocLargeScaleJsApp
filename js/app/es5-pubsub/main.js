$(function () {
    'use strict';

    var dataTablesFactory = (function() {

        var _selector = 'table.datatables';
        var _config = {
            'bInfo': false,
            'bFilter': false,
            'bLengthChange': false
        };

        var _api = {
            selector: selector,
            setup: setup,
            instantiate: instantiate
        };

        return _api;

        ///////////

        function selector(jQuerySelector) {
            _selector = jQuerySelector;

            return _api;
        }

        function setup(config) {
            _config = $.extend({}, _config, config);

            return _api;
        }

        function instantiate () {
            var tableElement = $(_selector);

            configureDataSortTypes(tableElement);

            var _table = tableElement.dataTable(_config);
            var _redraw = true;

            var methods = {
                addRow: addRow,
                removeRow: removeRow,
                getNodes: getNodes,
                dataTablesObject: _table
            };

            return methods;

            ///////////////

            function addRow(rowData) {
                var addedRow = _table.fnAddData(rowData, _redraw);
                amplify.publish('table.rowAdded');
                return addedRow;
            }

            function removeRow(row, callback) {
                var removedRow = _table.fnDeleteRow(row, callback, _redraw);

                return {
                    data: convertRowToRawData(removedRow)
                };
            }

            function convertRowToRawData(row) {
                if (isDatatableRowObject(row)) { return row[0]._aData; }

                return row;
            }

            function isDatatableRowObject(row) {
                return $.isArray(row) && ('_aData' in row[0]);
            }

            function getNodes() {
                return _table.fnGetNodes();
            }
        }

        function configureDataSortTypes(table) {
            var headers = table.find('thead th');

            var sortingConfig = {
                aoColumns: []
            };

            headers.each(function (index, element) {
                var sortingType = $(element).data().sortingType;
                sortingConfig.aoColumns.push({ "sSortDataType": sortingType });
            });

            _config = $.extend({}, _config, sortingConfig);
        }
    })();

    var selectableTableFactory = function () {

        var factory = {
            init: init
        };

        return factory;

        function init(dataTablesObject) {

            var _table = dataTablesObject;

            init();

            var methods = {
                getSelectedRow: getSelectedRow,
                deselectAllRowsOnPage: deselectAllRowsOnPage
            };

            return methods;

            ///////////////

            function init() {
                bindEvents();
                registerSubscriptions();
            }

            function bindEvents() {
                var selector = _table.selector + ' tbody tr';
                $(document).on('click', selector, selectRow);
            }

            function registerSubscriptions() {
                amplify.subscribe('table.rowAdded', deselectAllRowsOnPage);
                amplify.subscribe('table.rowSelected', deselectAllRowsOnPage);
            }

            function selectRow(event) {
                amplify.publish('table.rowSelected');

                var _this = $(event.currentTarget);
                _this.addClass('selected');
            }

            function deselectAllRowsOnPage() {
                $(_table.fnGetNodes()).removeClass('selected');
                $('tbody tr.selected').removeClass('selected');
            }

            function getSelectedRow() {
                var rows = $(_table.fnGetNodes());
                var selectedRow = rows.filter('tr.selected');
                var rowData = mapToRowData(selectedRow);

                if (rowData.length) {
                    return {
                        index: rows.index(selectedRow),
                        data: rowData
                    };
                } else {
                    return undefined;
                }
            }

            function mapToRowData(selectedRow) {
                var rowCells = selectedRow.find('td');

                return $.map(rowCells, function (cell, key) {
                    return $(cell).html();
                });
            }
        }
    }();

    (function validationMessages() {
        var _messageContainer = $('.validation-message');
        var _closeBtn = _messageContainer.find('.close');

        init();

        ///////

        function init() {
            bindEvents();
            subscribeToEvents();
        }

        function bindEvents() {
            _closeBtn.on('click', hideMessage);
        }

        function hideMessage() {
            _messageContainer.addClass('hidden');
        }

        function subscribeToEvents() {
            amplify.subscribe('validation.isValid', hideMessage);
            amplify.subscribe('validation.notValid', showMessage);
        }

        function showMessage(validationMessage) {
            _messageContainer
                .removeClass('hidden')
                .find('span').text(validationMessage);
        }
    })();

    var complexFormValidator = (function () {

        var _nameField = $('form').find('[name=name]');

        var validator = {
            isValid: isValid
        };

        return validator;

        /////////////////

        function isValid() {
            if (nameFieldIsEmpty()) {
                amplify.publish('validation.notValid', 'Name is required');
                return false;
            }

            amplify.publish('validation.isValid');

            return true;
        }

        function nameFieldIsEmpty() {
            return !_nameField.val();
        }
    })();

    var complexFormController = (function (complexFormValidator, dataTablesFactory) {

        var _form = $('form');
        var _addItemBtn = $('#addItemBtn');
        var _removeItemBtn = $('#removeItemBtn');
        var _validator = complexFormValidator;
        var _selectedItems = {};
        var _existingItems = {};

        init();

        ///////

        function init() {
            setupTables();
            bindEvents();
        }

        function setupTables() {
            var setup = {
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

            _selectedItems = dataTablesFactory
                .selector('#selectedItems')
                .setup(setup)
                .instantiate();

            _selectedItems = $.extend({},
                _selectedItems,
                selectableTableFactory.init(_selectedItems.dataTablesObject));

            _existingItems = dataTablesFactory
                .selector('#existingItems')
                .setup(setup)
                .instantiate();

            _existingItems = $.extend({},
                _existingItems,
                selectableTableFactory.init(_existingItems.dataTablesObject));
        }

        function bindEvents() {
            _form.on('submit', submitForm);
            _addItemBtn.on('click', addItem);
            _removeItemBtn.on('click', removeItem);
        }

        function submitForm() {
            var formIsValid = _validator.isValid();

            if (!formIsValid) {
                return false;
            }
        }

        function addItem() {
            var selectedRow = _existingItems.getSelectedRow();

            if (selectedRow) {
                var removedRow = _existingItems.removeRow(selectedRow.index);
                _selectedItems.addRow(removedRow.data);
            }
        }

        function removeItem() {
            var selectedRow = _selectedItems.getSelectedRow();

            if (selectedRow) {
                var removedRow = _selectedItems.removeRow(selectedRow.index);
                _existingItems.addRow(removedRow.data);
            }
        }

    })(complexFormValidator, dataTablesFactory);
});
