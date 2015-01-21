/// <reference path="../../app/main.ts" />
/// <reference path="../utils.ts" />

describe('validationMessagesController', function () {
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

    describe('.showMessage()', function () {
        it('should be called once when form is not valid', function () {
            // arrange
            var showMessageMethod = spyOn(_validationMessagesController, 'showMessage');
            spyOn(_view, 'getNameFieldValue').and.returnValue('');

            // act
            var result = _validator.formIsValid();

            // assert
            expect(showMessageMethod.wasCalled).toBeTruthy();
        });

        it('should remove .hidden CSS class from validation message container element', function () {
            // arrange
            var containerElement = createContainer();

            spyOn(_view.validationMessage, 'getContainerElement').and.returnValue(containerElement);

            // act
            _validationMessagesController.showMessage();

            //assert
            expect(containerElement.hasClass('hidden')).toBeFalsy();
        });

        it('should remove .hidden CSS class from sepecifc element based on its ID attribute that has same name of pubsub topic', function () {
            // arrange
            var validationElements = createValidationMessagesElements();

            spyOn(_view, 'getNameFieldValue').and.returnValue('');

            spyOn(_view.validationMessage, 'getContainerElement').and.returnValue(validationElements);

            // act
            _validationMessagesController.showMessage('validation-nameIsRequired');

            // assert
            var hasClassHidden = validationElements.find('#validation-nameIsRequired').hasClass('hidden');
            expect(hasClassHidden).toBeFalsy();
        });

        it('should insert .hidden CSS class in all another children', function () {
            // arrange
            var validationContainer = createValidationMessagesElementsWithoutCssHiddenClass();

            spyOn(_view, 'getNameFieldValue').and.returnValue('');

            spyOn(_view.validationMessage, 'getContainerElement').and.returnValue(validationContainer);

            // act
            _validationMessagesController.showMessage('validation-nameIsRequired');

            // assert
            var allMessages = validationContainer.children();
            var hiddenMessageElements = validationContainer.find('.hidden');

            expect(hiddenMessageElements.length).toEqual(allMessages.length - 1);
        });

        it("should show validation message for element with id attribute 'validation-nameIsRequired'", function () {
            // arrange
            var messagesContainerElement = createValidationMessagesElements();

            spyOn(_view.validationMessage, 'getContainerElement').and.returnValue(messagesContainerElement);

            // act
            _validationMessagesController.showMessage('validation-nameIsRequired');

            // assert
            var element = messagesContainerElement.find('#validation-nameIsRequired').get(0);
            expect(element).toBeDefined();

            var elementIsHidden = $(element).hasClass('hidden');
            expect(elementIsHidden).toBeFalsy();
        });

        it("should show validation message for element with id attribute 'validation-mustHaveAtLeastOneItemSelected'", function methodName() {
            // arrange
            var messagesContainerElement = createValidationMessagesElements();

            spyOn(_view.validationMessage, 'getContainerElement').and.returnValue(messagesContainerElement);

            // act
            _validationMessagesController.showMessage('validation-mustHaveAtLeastOneItemSelected');

            // assert
            var element = messagesContainerElement.find('#validation-mustHaveAtLeastOneItemSelected').get(0);
            expect(element).toBeDefined();

            var elementIsHidden = $(element).hasClass('hidden');
            expect(elementIsHidden).toBeFalsy();
        });

        it("should show validation message for element with id attribute 'validation-maximumNumberOfSelectedItemsIs50'", function () {
            // arrange
            var messagesContainerElement = createValidationMessagesElements();

            spyOn(_view.validationMessage, 'getContainerElement').and.returnValue(messagesContainerElement);

            // act
            _validationMessagesController.showMessage('validation-maximumNumberOfSelectedItemsIs50');

            // assert
            var element = messagesContainerElement.find('#validation-maximumNumberOfSelectedItemsIs50').get(0);

            expect(element).toBeDefined();

            var elementIsHidden = $(element).hasClass('hidden');

            expect(elementIsHidden).toBeFalsy();
        });
    });

    describe('.hideMessage()', function () {
        it('should be called when form is valid', function () {
            // arrange
            var hideMessageMethod = spyOn(_validationMessagesController, 'hideMessage');

            spyOn(_view, 'getNameFieldValue').and.returnValue('Some name');

            var rows = [[1, 'Row 1']];
            spyOn(_view.tables.selectedItems, 'getNodes').and.returnValue(rows);

            // act
            var result = _validator.formIsValid();

            // assert
            //expect(hideMessageMethod.wasCalled).toBeTruthy();
            expect(_validationMessagesController.hideMessage).toHaveBeenCalled();
        });

        it('should insert .hidden CSS class to validation message container element', function () {
            // arrange
            var validationContainerElement = createContainer();

            spyOn(_view.validationMessage, 'getContainerElement').and.returnValue(validationContainerElement);

            // act
            _validationMessagesController.hideMessage();

            // assert
            var hasClassHidden = validationContainerElement.hasClass('hidden');
            expect(hasClassHidden).toBeTruthy();
        });
    });
}); 