(function () {
	'use strict';

	describe('complexFormController', function() {
	    var _controller, _view, _validator, _validationMessagesController;

	    beforeEach(function  () {
	        _view = view(dataTablesFactory, selectableTableFactory, reorderableTableFactory);
	        _validator = formValidator(_view);
	        _validationMessagesController = validationMessagesController(_view);
	        _controller = complexFormController(_view, _validator, _validationMessagesController);
	    });

	    afterEach(function () {
	    	_controller.unsubscribeAllTopics();
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
	    		_validator.numberOfSelectedItemsIsGraterThanOrEqual50.restore();
	    		_view.tables.existingItems.getSelectedRow.restore();
	    	});

	    	it('should move an item from Existing Items table to Selected Items table', function () {
	    		// arrange
	    		sinon.stub(_validator, 'numberOfSelectedItemsIsGraterThanOrEqual50');
	    		_validator.numberOfSelectedItemsIsGraterThanOrEqual50.returns(false);

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
	    		sinon.stub(_validator, 'numberOfSelectedItemsIsGraterThanOrEqual50');
	    		_validator.numberOfSelectedItemsIsGraterThanOrEqual50.returns(false);

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
	    		sinon.stub(_validator, 'numberOfSelectedItemsIsGraterThanOrEqual50');
	    		_validator.numberOfSelectedItemsIsGraterThanOrEqual50.returns(false);

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

	    	it('should not move an new item to Selected Items table if the number of rows of Selected Items table is grater than or equal 50', function() {
	    		// arrange
	    		sinon.stub(_validator, 'numberOfSelectedItemsIsGraterThanOrEqual50');
	    		_validator.numberOfSelectedItemsIsGraterThanOrEqual50.returns(true);

	    		stubTheSelectedRowAtTable({
	    			index: 0,
	    			data: ['Row 1']
	    		}, _view.tables.existingItems);

	    		var removeRowMethodSpy = sinon.spy(_view.tables.existingItems, 'removeRow');
	    		var addRowMethodSpy = sinon.spy(_view.tables.selectedItems, 'addRow');

	    		// act
	    		_controller.addItem();

	    		// assert
	    		expect(removeRowMethodSpy.called).to.be.false;
	    		expect(addRowMethodSpy.called).to.be.false;

	    		_view.tables.existingItems.removeRow.restore();
	    		_view.tables.selectedItems.addRow.restore();
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

	    describe('.showNameRequiredValidationMessage()', function() {
	    	it("should call _validationMessagesController.showMessage() with argument 'validation-nameIsRequired'", function() {
		    	// arrange
		    	var messagesContainerElement = createValidationMessagesElements();

		    	var showMessageMethodSpy = sinon.spy(_validationMessagesController, 'showMessage');
		    	showMessageMethodSpy.withArgs('validation-nameIsRequired');

		    	// act
		    	// debugger;
	    		_controller.showNameRequiredValidationMessage();

		    	// assert
		    	expect(showMessageMethodSpy.withArgs('validation-nameIsRequired').calledOnce).to.be.true;

		    	_validationMessagesController.showMessage.restore();
	    	});
	    });

	    describe('.showMustHaveAtLeastOneItemSelectedValidationMessage()', function() {
	    	it("should call _validationMessagesController.showMessage() with argument 'validation-mustHaveAtLeastOneItemSelected'", function() {
		    	// arrange
		    	var messagesContainerElement = createValidationMessagesElements();

		    	var showMessageMethodSpy = sinon.spy(_validationMessagesController, 'showMessage');
		    	showMessageMethodSpy.withArgs('validation-mustHaveAtLeastOneItemSelected');

		    	// act
		    	// debugger;
	    		_controller.showMustHaveAtLeastOneItemSelectedValidationMessage();

		    	// assert
		    	expect(showMessageMethodSpy.withArgs('validation-mustHaveAtLeastOneItemSelected').calledOnce).to.be.true;

		    	_validationMessagesController.showMessage.restore();
	    	});
	    });

	    describe('.registerSubscribers()', function() {
	    	it("should subscribe to 'validation-isValid' topic that calls _validationMessagesController.hideMessage()", function() {
	    		// arrange
	    		var hideMessageMethodSpy = sinon.spy(_validationMessagesController, 'hideMessage');

	    		// act
	    		amplify.publish('validation-isValid');

	    		// assert
	    		expect(hideMessageMethodSpy.calledOnce).to.be.true;

	    		_validationMessagesController.hideMessage.restore();
	    	});

	    	it("should subscribe to 'validation-nameIsRequired' topic that calls _validationMessagesController.showMessage('validation-nameIsRequired')", function() {
	    		// arrange
	    		var showMessageMethodSpy = sinon.spy(_validationMessagesController, 'showMessage');

	    		// act
	    		amplify.publish('validation-nameIsRequired');

	    		// assert
	    		expect(showMessageMethodSpy.withArgs('validation-nameIsRequired').calledOnce).to.be.true;

	    		_validationMessagesController.showMessage.restore();
	    	});

	    	it("should subscribe to 'validation-mustHaveAtLeastOneItemSelected' topic that calls _validationMessagesController.showMessage('validation-mustHaveAtLeastOneItemSelected')", function() {
	    		// arrange
	    		var showMessageMethodSpy = sinon.spy(_validationMessagesController, 'showMessage');

	    		// act
	    		amplify.publish('validation-mustHaveAtLeastOneItemSelected');

	    		// assert
	    		expect(showMessageMethodSpy.withArgs('validation-mustHaveAtLeastOneItemSelected').calledOnce).to.be.true;

	    		_validationMessagesController.showMessage.restore();
	    	});

	    	it("should subscribe to 'validation-maximumNumberOfSelectedItemsIs50' topic that calls _validationMessagesController.showMessage('validation-maximumNumberOfSelectedItemsIs50')");
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

	describe('formValidator', function() {
		var _controller, _view, _validator, _validationMessagesController;

	    beforeEach(function  () {
	        _view = view(dataTablesFactory, selectableTableFactory, reorderableTableFactory);
	        _validator = formValidator(_view);
	        _validationMessagesController = validationMessagesController(_view);
	        _controller = complexFormController(_view, _validator, _validationMessagesController);
	    });

	    afterEach(function () {
	    	_controller.unsubscribeAllTopics();
	    });

	    describe('.isValid()', function() {
	    	it('should return true if all conditions are satisfied', function () {
	    		// arrange
	    		sinon.stub(_view, 'getNameFieldValue');
	    		_view.getNameFieldValue.returns('Some name');

	    		var rows = [['Row 1']];
	    		sinon.stub(_view.tables.selectedItems, 'getNodes');
	    		_view.tables.selectedItems.getNodes.returns(rows);

	    		// act
	    		var result = _validator.isValid();

	    		// assert
	    		expect(result).to.be.true;
	    	});

	        it("should return false and publish the 'validation-nameIsRequired' pubsub topic if field name is empty", function() {
	            // arrange
	            var validationContainer = createContainer();

	            sinon.stub(_view, 'getNameFieldValue');
	            _view.getNameFieldValue.returns('');

	            sinon.stub(_view.validationMessage, 'getContainerElement');
				_view.validationMessage.getContainerElement.returns(validationContainer);

	            var subscriber = sinon.spy();

	            amplify.subscribe('validation-nameIsRequired', subscriber);

	            // act
	            var result = _validator.isValid();

	            // assert
	            expect(result).to.be.false;
	            expect(subscriber.calledOnce).to.be.true;

	            _view.getNameFieldValue.restore();
	            _view.validationMessage.getContainerElement.restore();
	        });

	        it("should return false and publish the 'validation-mustHaveAtLeastOneItemSelected' pubsub topic if there is no item on selected items table", function() {
	            // arrange
	            sinon.stub(_view, 'getNameFieldValue');
	            _view.getNameFieldValue.returns('Some name');

	            sinon.stub(_view.tables.selectedItems, 'getNodes');
	            _view.tables.selectedItems.getNodes.returns([]);

	            var subscriber = sinon.spy();

	            amplify.subscribe('validation-mustHaveAtLeastOneItemSelected', subscriber);

	            // act
	            var result = _validator.isValid();

	            // assert
	            expect(result).to.be.false;
	            expect(subscriber.calledOnce).to.be.true;

	            _view.getNameFieldValue.restore();
	            _view.tables.selectedItems.getNodes.restore();
	        });

			it("should return false and publish the 'validation-maximumNumberOfSelectedItemsIs50' pubsub topic if there is more than 50 items on selected items table", function() {
				// arrange
	            sinon.stub(_view, 'getNameFieldValue');
	            _view.getNameFieldValue.returns('Some name');

	            var exceededNodes = [];
	            exceededNodes.length = 51;

	            sinon.stub(_view.tables.selectedItems, 'getNodes');
	            _view.tables.selectedItems.getNodes.returns(exceededNodes);

	            var subscriber = sinon.spy();

	            amplify.subscribe('validation-maximumNumberOfSelectedItemsIs50', subscriber);

	            // act
	            var result = _validator.isValid();

	            // assert
	            expect(result).to.be.false;
	            expect(subscriber.calledOnce).to.be.true;

	            _view.getNameFieldValue.restore();
	            _view.tables.selectedItems.getNodes.restore();
			});
	    });

		describe('.numberOfSelectedItemsIsGraterThanOrEqual50()', function() {
			it('should return true if the number of rows of Selected Items table is grater than 50');
			it('should return true if the number of rows of Selected Items table is equal 50');
			it('should return false if the number of rows of Selected Items table is less than 50');
		});
	});

	describe('validationMessagesController', function() {
		var _controller, _view, _validator, _validationMessagesController;

		beforeEach(function () {
			_view = view(dataTablesFactory, selectableTableFactory, reorderableTableFactory);
	        _validator = formValidator(_view);
	        _validationMessagesController = validationMessagesController(_view);
	        _controller = complexFormController(_view, _validator, _validationMessagesController);
		});

		afterEach(function () {
	    	_controller.unsubscribeAllTopics();
	    });

		describe('.showMessage()', function () {
			it('should be called once when form is not valid', function() {
				// arrange
				var showMessageMethod = sinon.spy(_validationMessagesController, 'showMessage');

				sinon.stub(_view, 'getNameFieldValue');
				_view.getNameFieldValue.returns('');

				// act
				var result = _validator.isValid();

				// assert
				expect(showMessageMethod.calledOnce).to.be.true;

				_validationMessagesController.showMessage.restore();
				_view.getNameFieldValue.restore();
			});

			it('should remove .hidden CSS class from validation message container element', function () {
				// arrange
				var containerElement = createContainer();

				sinon.stub(_view.validationMessage, 'getContainerElement');
				_view.validationMessage.getContainerElement.returns(containerElement);

				// act
				_validationMessagesController.showMessage();

				//assert
				expect(containerElement.hasClass('hidden')).to.be.false;

				_view.validationMessage.getContainerElement.restore();
			});

			it('should remove .hidden CSS class from sepecifc element based on its ID attribute that has same name of pubsub topic', function () {
				// arrange
				var validationElements = createValidationMessagesElements();

				sinon.stub(_view, 'getNameFieldValue');
				_view.getNameFieldValue.returns('');

				sinon.stub(_view.validationMessage, 'getContainerElement');
				_view.validationMessage.getContainerElement.returns(validationElements);

				// act
				_validationMessagesController.showMessage('validation-nameIsRequired');

				// assert
				var hasClassHidden = validationElements.find('#validation-nameIsRequired').hasClass('hidden');
				expect(hasClassHidden).to.be.false;

				_view.getNameFieldValue.restore();
				_view.validationMessage.getContainerElement.restore();
			});

			it('should insert .hidden CSS class in all another children', function () {
				// arrange
				var validationContainer = createValidationMessagesElementsWithoutCssHiddenClass();


				sinon.stub(_view, 'getNameFieldValue');
				_view.getNameFieldValue.returns('');

				sinon.stub(_view.validationMessage, 'getContainerElement');
				_view.validationMessage.getContainerElement.returns(validationContainer);

				// act
				_validationMessagesController.showMessage('validation-nameIsRequired');

				// assert
				var allMessages = validationContainer.children();
				var hiddenMessageElements = validationContainer.find('.hidden');
				expect(hiddenMessageElements.length).to.be.equal(allMessages.length - 1);

				_view.getNameFieldValue.restore();
				_view.validationMessage.getContainerElement.restore();
			});

			it("should show validation message for element with id attribute 'validation-nameIsRequired'", function () {
				// arrange
				var messagesContainerElement = createValidationMessagesElements();

				sinon.stub(_view.validationMessage, 'getContainerElement');
				_view.validationMessage.getContainerElement.returns(messagesContainerElement);

				// act
				_validationMessagesController.showMessage('validation-nameIsRequired');

				// assert
				var element = messagesContainerElement.find('#validation-nameIsRequired').get(0);
				expect(element).to.exist;

				var elementIsHidden = $(element).hasClass('hidden');
				expect(elementIsHidden).to.be.false;

				_view.validationMessage.getContainerElement.restore();
			});

			it("should show validation message for element with id attribute 'validation-mustHaveAtLeastOneItemSelected'", function methodName() {
				// arrange
				var messagesContainerElement = createValidationMessagesElements();

				sinon.stub(_view.validationMessage, 'getContainerElement');
				_view.validationMessage.getContainerElement.returns(messagesContainerElement);

				// act
				_validationMessagesController.showMessage('validation-mustHaveAtLeastOneItemSelected');

				// assert
				var element = messagesContainerElement.find('#validation-mustHaveAtLeastOneItemSelected').get(0);
				expect(element).to.exist;

				var elementIsHidden = $(element).hasClass('hidden');
				expect(elementIsHidden).to.be.false;

				_view.validationMessage.getContainerElement.restore();
			});

			it("should show validation message for element with id attribute 'validation-maximumNumberOfSelectedItemsIs50'", function () {
				// arrange
				var messagesContainerElement = createValidationMessagesElements();

				sinon.stub(_view.validationMessage, 'getContainerElement');
				_view.validationMessage.getContainerElement.returns(messagesContainerElement);

				// act
				_validationMessagesController.showMessage('validation-maximumNumberOfSelectedItemsIs50');

				// assert
				var element = messagesContainerElement.find('#validation-maximumNumberOfSelectedItemsIs50').get(0);
				expect(element).to.exist;

				var elementIsHidden = $(element).hasClass('hidden');
				expect(elementIsHidden).to.be.false;

				_view.validationMessage.getContainerElement.restore();
			});
		});

		describe('.hideMessage()', function () {
			it('should be called when form is valid', function() {
				// arrange
				var hideMessageMethod = sinon.spy(_validationMessagesController, 'hideMessage');

				sinon.stub(_view, 'getNameFieldValue');
				_view.getNameFieldValue.returns('Some name');

				var rows = [[1, 'Row 1']];
				sinon.stub(_view.tables.selectedItems, 'getNodes');
				_view.tables.selectedItems.getNodes.returns(rows);

				// act
				var result = _validator.isValid();

				// assert
				expect(hideMessageMethod.calledOnce).to.be.true;

				_validationMessagesController.hideMessage.restore();
				_view.tables.selectedItems.getNodes.restore();
			});

			it('should insert .hidden CSS class to validation message container element', function () {
				// arrange
				var validationContainerElement = createContainer();

				sinon.stub(_view.validationMessage, 'getContainerElement');
				_view.validationMessage.getContainerElement.returns(validationContainerElement);

				// act
				_validationMessagesController.hideMessage();

				// assert
				var hasClassHidden = validationContainerElement.hasClass('hidden');
				expect(hasClassHidden).to.be.true;
			});
		});
	});

	function createValidationMessagesElements() {
		var container = createContainer();

		createValidationMessage('validation-nameIsRequired').appendTo(container);
		createValidationMessage('validation-mustHaveAtLeastOneItemSelected').appendTo(container);
		createValidationMessage('validation-maximumNumberOfSelectedItemsIs50').appendTo(container);

		return container;
	}

	function createValidationMessagesElementsWithoutCssHiddenClass() {
		var container = createContainer();

		createValidationMessage('validation-nameIsRequired').removeClass('hidden').appendTo(container);
		createValidationMessage('validation-mustHaveAtLeastOneItemSelected').removeClass('hidden').appendTo(container);
		createValidationMessage('validation-maximumNumberOfSelectedItemsIs50').removeClass('hidden').appendTo(container);

		return container;
	}

	function createContainer() {
		return $('<div>')
			.addClass('validation-message-container')
			.addClass('hidden');
	}

	function createValidationMessage(elementId) {
		var element = $('<div>')
			.prop('id', elementId)
			.addClass('alert hidden');

		return element;
	}
})();
