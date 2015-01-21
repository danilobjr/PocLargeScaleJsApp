/// <reference path="../../app/main.ts" />

describe('validator', function () {
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

    describe('.formIsValid()', function () {
        it('should return true if all conditions are satisfied', function () {
            // arrange
            spyOn(_view, 'getNameFieldValue').and.returnValue('Some value');

            var rows = [['Row 1']];
            spyOn(_view.tables.selectedItems, 'getNodes');
            _view.tables.selectedItems.getNodes.and.returnValue(rows);

            // act
            var result = _validator.formIsValid();

            // assert
            expect(result).toBeTruthy();
        });

        it("should return false and publish the 'validation-nameIsRequired' pubsub topic if field name is empty", function () {
            // arrange
            var validationContainer = createContainer();

            spyOn(_view, 'getNameFieldValue').and.returnValue('');

            var subscriber = jasmine.createSpy('spy');

            amplify.subscribe('validation-nameIsRequired', subscriber);

            // act
            var result = _validator.formIsValid();

            // assert
            expect(result).toBeFalsy();
            expect(subscriber).toHaveBeenCalled();
        });

        it("should return false and publish the 'validation-mustHaveAtLeastOneItemSelected' pubsub topic if there is no item on selected items table", function () {
            // arrange
            spyOn(_view, 'getNameFieldValue').and.returnValue('Some name');

            spyOn(_view.tables.selectedItems, 'getNodes').and.returnValue([]);

            var subscriber = jasmine.createSpy('spy');

            amplify.subscribe('validation-mustHaveAtLeastOneItemSelected', subscriber);

            // act
            var result = _validator.formIsValid();

            // assert
            expect(result).toBeFalsy();
            expect(subscriber).toHaveBeenCalled();
        });

        it("should return false and publish the 'validation-maximumNumberOfSelectedItemsIs50' pubsub topic if there is more than 50 items on selected items table", function () {
            // arrange
            spyOn(_view, 'getNameFieldValue').and.returnValue('Some name');

            var exceededNodes = [];
            exceededNodes.length = 51;

            spyOn(_view.tables.selectedItems, 'getNodes').and.returnValue(exceededNodes);

            var subscriber = jasmine.createSpy('spy');

            amplify.subscribe('validation-maximumNumberOfSelectedItemsIs50', subscriber);

            // act
            var result = _validator.formIsValid();

            // assert
            expect(result).toBeFalsy();
            expect(subscriber).toHaveBeenCalled();
        });
    });

    describe('.selectedItemsTableIsFull()', function () {
        it('should return true if the number of rows of Selected Items table is 50', function () {
            // arrange
            var rows = generateArrayOfLength(50);

            spyOn(_view.tables.selectedItems, 'getNodes').and.returnValue(rows);

            // act
            var result = _validator.selectedItemsTableIsFull();

            // assert
            expect(result).toBeTruthy();
        });

        it('should return false if the number of rows of Selected Items table is less than 50', function () {
            // arrange
            var rows = generateArrayOfLength(49);

            spyOn(_view.tables.selectedItems, 'getNodes').and.returnValue(rows);

            // act
            var result = _validator.selectedItemsTableIsFull();

            // assert
            expect(result).toBeFalsy();
        });

        function generateArrayOfLength(arrayLength) {
            var rows = [];

            for (var i = 1; i <= arrayLength; i++) {
                rows.push(['Row ' + i]);
            };

            return rows;
        }
    });
});
 