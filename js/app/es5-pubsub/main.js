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

        function instantiate () {
            var table = $(_selector);

            configureDataSortTypes(table);
            debugger;
            return table.dataTable(_config);
        }

        function setup(config) {
            _config = $.extend({}, _config, config);

            return _api;
        }

        function selector(jQuerySelector) {
            _selector = jQuerySelector;

            return _api;
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
            var nameFieldIsEmpty = !_nameField.val();

            if (nameFieldIsEmpty) {
                amplify.publish('validation.notValid', 'Name is required');
                return false;
            }

            amplify.publish('validation.isValid');

            return true;
        }
    })();

    var complexFormController = (function (complexFormValidator, dataTablesFactory) {

        var _form = $('form');
        var _validator = complexFormValidator;
        var _selectedTesters = {};
        var _existingTesters = {};
        _form.on('submit', submitForm);

        init();

        ///////

        function init() {
            setupTables();
            bindEvents();
        }

        function setupTables() {
            var setup = { bSort: false };

            _selectedTesters = dataTablesFactory
                .selector('#selectedTesters')
                .setup(setup)
                .instantiate();

            _existingTesters = dataTablesFactory
                .selector('#existingTesters')
                .setup(setup)
                .instantiate();
        }

        // function bindEvents() {
        //     _form.on('submit', submitForm);
        // }

        function submitForm() {
            var formIsValid = _validator.isValid();

            if (!formIsValid) {
                return false;
            }
        }

    })(complexFormValidator, dataTablesFactory);
});
