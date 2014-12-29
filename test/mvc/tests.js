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
    	it('should move an item from Existing Items table to Selected Items table', function () {
    		// arrange
    		var numberOfItemsToBeCreated = 3;
    		var existingItems = seedItemsInTable(_view.tables.existingItems, numberOfItemsToBeCreated);
    		var rowIndex = 0;
    		var rowToBeMoved = existingItems[rowIndex];

    		sinon.stub(_view.tables.existingItems, 'getSelectedRow');
    		_view.tables.existingItems.getSelectedRow.returns({
    			index: rowIndex,
    			data: rowToBeMoved
    		});

    		// act
    		_controller.addItem();

    		// assert
    		expect(_view.tables.selectedItems.getNodes()).to.have.length(1);
    	});

    	it('should insert an ordering number as first element of row', function() {
    		// arrange
    		var numberOfItemsToBeCreated = 3;
    		var existingItems = seedItemsInTable(_view.tables.existingItems, numberOfItemsToBeCreated);
    		var rowIndex = 0;
    		var rowToBeMoved = existingItems[rowIndex];

    		sinon.stub(_view.tables.existingItems, 'getSelectedRow');
    		_view.tables.existingItems.getSelectedRow.returns({
    			index: rowIndex,
    			data: rowToBeMoved
    		});

    		// act
    		_controller.addItem();

    		// assert
    		var firstElementOfRow = _view.tables.selectedItems.getNodes()[rowIndex][0];
    		expect(firstElementOfRow).to.be.a('number');
    	});

    	it('should inser an ordering number that matches the table length');

    	function seedItemsInTable(table, numberOfItems) {
    		for (var i = 0; i < numberOfItems; i++) {
    			var row = ['Item ' + (i + 1)];
    			table.addRow(row);
    		}
    		// var rows = [
    		// 	['Item 1'],
    		// 	['Item 2'],
    		// 	['Item 3']
    		// ];

    		// rows.forEach(function (row) {
    		// 	_view.tables.existingItems.addRow(row);
    		// });

    		return table.getNodes();
    	}
    });
});

describe('validator', function() {
	var _controller, _view, _validator;

    beforeEach(function  () {
        _view = view(dataTablesFactory, selectableTableFactory, reorderableTableFactory);
        _validator = formValidator(_view);
        // _controller = complexFormController(_view, _validator);
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
