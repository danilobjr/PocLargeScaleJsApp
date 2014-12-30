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
    		var numberOfItems = 3;
    		var existingItems = seedExistingItemsTable(numberOfItems);

    		stubTheSelectedRowAtTable({
    			index: 0,
    			data: existingItems[0]
    		}, _view.tables.existingItems);

    		// act
    		_controller.addItem();

    		// assert
    		expect(_view.tables.selectedItems.getNodes()).to.have.length(1);
    	});

    	it('should insert an ordering number as first element of row', function() {
    		// arrange
    		var numberOfItems = 3;
    		var existingItems = seedExistingItemsTable(numberOfItems);

    		stubTheSelectedRowAtTable({
    			index: 0,
    			data: existingItems[0]
    		}, _view.tables.existingItems);

    		// act
    		_controller.addItem();

    		// assert
    		var dataOffirstColumnOfFirstRow = _view.tables.selectedItems.getNodes()[0][0];
    		expect(dataOffirstColumnOfFirstRow).to.be.a('number');
    	});

    	it('should insert an ordering number that matches the table length', function () {
    		// arrange
    		var numberOfItems = 3;
    		var existingItems = seedExistingItemsTable(numberOfItems);

    		stubTheSelectedRowAtTable({
    			index: 0,
    			data: existingItems[0]
    		}, _view.tables.existingItems);

    		numberOfItems = 2;
    		var selectedItems = seedSelectedItemsTable(numberOfItems);

    		// act
    		_controller.addItem();

    		// assert
    		var selectedItemsTableLength = _view.tables.selectedItems.getNodes().length;
    		var lastRow = _view.tables.selectedItems.getNodes()[selectedItemsTableLength - 1];
    		var rowOrder = lastRow[0];

    		expect(rowOrder).to.be.equal(selectedItemsTableLength);
    	});
    });

	describe('.removeItem()', function() {
		it('should move an item from selected items table to existing items table', function () {
			// arrange
			var numberOfItems = 3;
			var selectedItems = seedSelectedItemsTable(numberOfItems);

			stubTheSelectedRowAtTable({
				index: 0,
				data: selectedItems[0]
			}, _view.tables.selectedItems);

			// act
			_controller.removeItem();

			// assert
			expect(_view.tables.existingItems.getNodes()).to.have.length(1);
		});

		it('should remove the ordering number from row', function() {
			// arrange
			var numberOfItems = 3;
			var selectedItems = seedSelectedItemsTable(numberOfItems);

			var selectedRow = {
				index: 0,
				data: selectedItems[0]
			};

			var firstColumnDataBeforeRemoval = selectedRow.data[0];
			var numberOfColumnsOfSelectedRow = selectedRow.data.length;

			stubTheSelectedRowAtTable(selectedRow, _view.tables.selectedItems);

			// act
			_controller.removeItem();

			// assert
			var removedRow = _view.tables.existingItems.getNodes()[0];
			var firstColumnOfRemovedRow = removedRow[0];
			expect(firstColumnDataBeforeRemoval).to.not.equal(firstColumnOfRemovedRow);
			expect(numberOfColumnsOfSelectedRow - removedRow.length).to.be.equal(1);
		});
	});

	describe('.moveRowUp()', function() {
		it('description');
	});

	describe('.moveRowDown()', function() {
		it('description');
	});

	function seedExistingItemsTable(numberOfItems) {
		for (var i = 1; i <= numberOfItems; i++) {
			var row = ['Item ' + i];
			_view.tables.existingItems.addRow(row);
		}

		return _view.tables.existingItems.getNodes();
	}

	function seedSelectedItemsTable(numberOfItems) {
		for (var i = 1; i <= numberOfItems; i++) {

			var row = [i, 'Item ' + i];
			_view.tables.selectedItems.addRow(row);
		}

		return _view.tables.selectedItems.getNodes();
	}

	function stubTheSelectedRowAtTable(row, table) {
		sinon.stub(table, 'getSelectedRow');
		table.getSelectedRow.returns(row);
	}
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

describe('validationMessages', function() {
	describe('.showMessage()', function () {
		it('description');
	});
	describe('.hideMessage()', function () {
		it('description');
	});
});
