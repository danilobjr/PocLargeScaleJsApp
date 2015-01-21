/// <reference path="../../app/main.ts" />
/// <reference path="../utils.ts" />

describe('complexFormController', function () {
    var _controller, _view, _validator, _validationMessagesController;

    beforeEach(function () {
        _view = view(dataTablesFactory, selectableTableFactory, reorderableTableFactory);
        _validator = validator(_view);
        _validationMessagesController = validationMessagesController(_view);
        _controller = complexFormController(_view, _validator, _validationMessagesController);
    });

    afterEach(function () {
        _controller.unsubscribeAllTopics();
    });

    describe('.submitForm()', function () {
        it("should return false if view's form is not valid", function () {
            // arrange
            spyOn(_validator, 'formIsValid').and.returnValue(false);

            // act
            var formSubmitted = _controller.submitForm();

            // assert
            expect(formSubmitted).toBeFalsy();
        });
    });

    describe('.addItem()', function () {

        it('should move an item from Existing Items table to Selected Items table', function () {
            // arrange
            spyOn(_validator, 'selectedItemsTableIsFull').and.returnValue(false);

            var numberOfItems = 3;
            var existingItems = seedExistingItemsTable(numberOfItems);

            stubTheSelectedRowAtTable({
                index: 0,
                data: existingItems[0]
            }, _view.tables.existingItems);

            // act
            _controller.addItem();

            // assert
            expect(_view.tables.selectedItems.getNodes().length).toBe(1);
        });

        it('should insert an ordering number as first element of row', function () {
            // arrange
            spyOn(_validator, 'selectedItemsTableIsFull').and.returnValue(false);

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
            expect(typeof dataOffirstColumnOfFirstRow).toBe('number');
        });

        it('should insert an ordering number that matches the table length', function () {
            // arrange
            spyOn(_validator, 'selectedItemsTableIsFull').and.returnValue(false);

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

            expect(rowOrder).toEqual(selectedItemsTableLength);
        });

        it('should not move an new item to Selected Items table if the number of rows of Selected Items table is grater than or equal 50', function () {
            // arrange
            spyOn(_validator, 'selectedItemsTableIsFull').and.returnValue(true);

            stubTheSelectedRowAtTable({
                index: 0,
                data: ['Row 1']
            }, _view.tables.existingItems);

            var removeRowMethodSpy = spyOn(_view.tables.existingItems, 'removeRow');
            var addRowMethodSpy = spyOn(_view.tables.selectedItems, 'addRow');

            // act
            _controller.addItem();

            // assert
            expect(removeRowMethodSpy.wasCalled).toBeFalsy();
            expect(addRowMethodSpy.wasCalled).toBeFalsy();
        });
    });

    describe('.removeItem()', function () {
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
            expect(_view.tables.existingItems.getNodes().length).toBe(1);
        });

        it('should remove the ordering number from row', function () {
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

            expect(firstColumnDataBeforeRemoval).not.toEqual(firstColumnOfRemovedRow);
            expect(numberOfColumnsOfSelectedRow - removedRow.length).toEqual(1);
        });
    });

    describe('.moveRowUp()', function () {
        it('description');
    });

    describe('.moveRowDown()', function () {
        it('description');
    });

    describe('.showNameRequiredValidationMessage()', function () {
        it("should call _validationMessagesController.showMessage() with argument 'validation-nameIsRequired'", function () {
            // arrange
            var messagesContainerElement = createValidationMessagesElements();

            var showMessageMethod = spyOn(_validationMessagesController, 'showMessage');
            //showMessageMethod.withArgs('validation-nameIsRequired');

            // act
            _controller.showNameRequiredValidationMessage();

            // assert
            expect(showMessageMethod).toHaveBeenCalledWith('validation-nameIsRequired');
        });
    });

    describe('.showMustHaveAtLeastOneItemSelectedValidationMessage()', function () {
        it("should call _validationMessagesController.showMessage() with argument 'validation-mustHaveAtLeastOneItemSelected'", function () {
            // arrange
            var messagesContainerElement = createValidationMessagesElements();

            var showMessageMethod = spyOn(_validationMessagesController, 'showMessage');
            //showMessageMethod.withArgs('validation-mustHaveAtLeastOneItemSelected');

            // act
            _controller.showMustHaveAtLeastOneItemSelectedValidationMessage();

            // assert
            expect(showMessageMethod).toHaveBeenCalledWith('validation-mustHaveAtLeastOneItemSelected');
        });
    });

    describe('.showMaximumNumberOfSelectedItemsIs50ValidationMessage()', function () {
        it("should call _validationMessagesController.showMessage() with argument 'validation-maximumNumberOfSelectedItemsIs50'", function () {
            // arrange
            var messagesContainerElement = createValidationMessagesElements();

            var showMessageMethod = spyOn(_validationMessagesController, 'showMessage');
            //showMessageMethod.withArgs('validation-maximumNumberOfSelectedItemsIs50');

            // act
            _controller.showMaximumNumberOfSelectedItemsIs50ValidationMessage();

            // assert
            expect(showMessageMethod).toHaveBeenCalledWith('validation-maximumNumberOfSelectedItemsIs50');
        });
    });

    describe('.registerSubscribers()', function () {
        it("should subscribe to 'validation-formIsValid' topic that calls _validationMessagesController.hideMessage()", function () {
            // arrange
            spyOn(_validationMessagesController, 'hideMessage');

            // act
            amplify.publish('validation-formIsValid');

            // assert
            expect(_validationMessagesController.hideMessage).toHaveBeenCalled();
        });

        it("should subscribe to 'validation-nameIsRequired' topic that calls _validationMessagesController.showMessage('validation-nameIsRequired')", function () {
            // arrange
            spyOn(_validationMessagesController, 'showMessage');

            // act
            amplify.publish('validation-nameIsRequired');

            // assert
            expect(_validationMessagesController.showMessage).toHaveBeenCalledWith('validation-nameIsRequired');
        });

        it("should subscribe to 'validation-mustHaveAtLeastOneItemSelected' topic that calls _validationMessagesController.showMessage('validation-mustHaveAtLeastOneItemSelected')", function () {
            // arrange
            var showMessageMethod = spyOn(_validationMessagesController, 'showMessage');

            // act
            amplify.publish('validation-mustHaveAtLeastOneItemSelected');

            // assert
            expect(showMessageMethod).toHaveBeenCalledWith('validation-mustHaveAtLeastOneItemSelected');
        });

        it("should subscribe to 'validation-maximumNumberOfSelectedItemsIs50' topic that calls _validationMessagesController.showMessage('validation-maximumNumberOfSelectedItemsIs50')", function () {
            // arrange
            var showMessageMethod = spyOn(_validationMessagesController, 'showMessage');

            // act
            amplify.publish('validation-maximumNumberOfSelectedItemsIs50');

            // assert
            expect(showMessageMethod).toHaveBeenCalledWith('validation-maximumNumberOfSelectedItemsIs50');
        });
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
        spyOn(table, 'getSelectedRow').and.returnValue(row);
    }
});
