'use strict';

describe('controller', function() {
    var _controller, _view, _validator;

    beforeEach(function  () {
        _view = view(dataTablesFactory, selectableTableFactory, reorderableTableFactory);
        _validator = formValidator(_view);
        _controller = complexFormController(_view, _validator);
    });

    describe('.submitForm()', function() {
        it("should return false if view's form is not valid", function() {
            // arrange
            sinon.stub(_validator, 'isValid');
            _validator.isValid.returns(false);

            // act
            var formSubmitted = _controller.submitForm();

            // assert
            expect(formSubmitted).to.be.false;

            _validator.isValid.restore();
        });
    });

    describe('.addItem()', function() {

    	afterEach(function () {
    		_view.tables.existingItems.getSelectedRow.restore();
    	});

    	it('should move an item from Existing Items table to Selected Items table', function () {
    		// arrange
    		var existingItems = populateExistingItemsTable();

    		stubTheSelectedRow({
    			index: 0,
    			data: existingItems[0]
    		});

    		// act
    		_controller.addItem();

    		// assert
    		expect(_view.tables.selectedItems.getNodes()).to.have.length(1);
    	});

    	it('should insert an ordering number as first element of row', function() {
    		// arrange
    		var existingItems = populateExistingItemsTable();

    		stubTheSelectedRow({
    			index: 0,
    			data: existingItems[0]
    		});

    		// act
    		_controller.addItem();

    		// assert
    		var dataOffirstColumnOfFirstRow = _view.tables.selectedItems.getNodes()[0][0];
    		expect(dataOffirstColumnOfFirstRow).to.be.a('number');
    	});

    	it('should insert an ordering number that matches the table length', function () {
    		// arrange
    		var existingItems = populateExistingItemsTable();

    		stubTheSelectedRow({
    			index: 0,
    			data: existingItems[0]
    		});

    		var rowsLength = 2;
    		var selectedItems = seedItemsInTable(_view.tables.selectedItems, rowsLength);

    		// act
    		_controller.addItem();

    		// assert
    		var selectedItemsTableLength = _view.tables.selectedItems.getNodes().length;
    		var lastRow = _view.tables.selectedItems.getNodes()[selectedItemsTableLength - 1];
    		var rowOrder = lastRow[0];

    		expect(rowOrder).to.be.equal(selectedItemsTableLength);
    	});

    	function seedItemsInTable(table, numberOfItems) {
    		for (var i = 0; i < numberOfItems; i++) {
    			var row = ['Item ' + (i + 1)];
    			table.addRow(row);
    		}

    		return table.getNodes();
    	}

    	function populateExistingItemsTable() {
    		var numberOfItemsToBeCreated = 3;
    		return seedItemsInTable(_view.tables.existingItems, numberOfItemsToBeCreated);
    	}

    	function stubTheSelectedRow(row) {
    		sinon.stub(_view.tables.existingItems, 'getSelectedRow');
    		_view.tables.existingItems.getSelectedRow.returns(row);
    	}
    });
});

describe('validator', function() {
	var _controller, _view, _validator;

    beforeEach(function  () {
        _view = view(dataTablesFactory, selectableTableFactory, reorderableTableFactory);
        _validator = formValidator(_view);
    });

    describe('.isValid()', function() {
        it("should return false and receive the message 'Name is required' if name field is empty", function() {
            // arrange
            sinon.stub(_view.form, 'getNameValue');
            _view.form.getNameValue.returns('');

            amplify.subscribe('validation.notValid', validationNotValidSubscription);

            // act
            var isValid = _validator.isValid();

            // assert
            expect(isValid).to.be.false;

            function validationNotValidSubscription(validationMessage) {
            	expect(validationMessage).to.be.equal('Name is required');
            }

            _view.form.getNameValue.restore();
            amplify.unsubscribe('validation.notValid', validationNotValidSubscription);
        });

        it("should return false and receive the message 'Must have at least one item selected' if none item is selected", function() {
            // arrange
            sinon.stub(_view.form, 'getNameValue');
            _view.form.getNameValue.returns('Some name');
            sinon.stub(_view.tables.selectedItems, 'getNodes');
            _view.tables.selectedItems.getNodes.returns([]);

            amplify.subscribe('validation.notValid', validationNotValidSubscription);

            // act
            var isValid = _validator.isValid();

            // assert
            expect(isValid).to.be.false;

            function validationNotValidSubscription(validationMessage) {
            	expect(validationMessage).to.be.equal('Must have at least one item selected');
            }

            _view.form.getNameValue.restore();
            _view.tables.selectedItems.getNodes.restore();
            amplify.unsubscribe('validation.notValid', validationNotValidSubscription);
        });

		it("should return false and receive the message 'Maximum number for selected items is 50' if none item is selected", function() {
			// arrange
            sinon.stub(_view.form, 'getNameValue');
            _view.form.getNameValue.returns('Some name');

            var exceededNodes = [];
            exceededNodes.length = 51;

            sinon.stub(_view.tables.selectedItems, 'getNodes');
            _view.tables.selectedItems.getNodes.returns(exceededNodes);

            amplify.subscribe('validation.notValid', validationNotValidSubscription);

            // act
            var isValid = _validator.isValid();

            // assert
            expect(isValid).to.be.false;

            function validationNotValidSubscription(validationMessage) {
            	expect(validationMessage).to.be.equal('Maximum number of selected items is 50');
            }

            _view.form.getNameValue.restore();
            _view.tables.selectedItems.getNodes.restore();
            amplify.unsubscribe('validation.notValid', validationNotValidSubscription);
		});
    });
});
