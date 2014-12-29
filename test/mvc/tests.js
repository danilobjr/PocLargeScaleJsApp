describe('controller', function() {
    // var _controller, _view, _validator;

    // beforeEach(function  () {
    //     _view = view(dataTablesFactory, selectableTableFactory, reorderableTableFactory);
    //     _controller = complexFormController(_view);
    // });

    // afterEach(function () {
    //     _controller.send.restore();
    // })

    describe('.submitForm()', function() {

        it("should return false if view's form is not valid", function() {
            // arrange
            var _view = view(dataTablesFactory, selectableTableFactory, reorderableTableFactory);
            var _validator = formValidator(_view);

            sinon.stub(_validator, 'isValid');
            _validator.isValid.returns(false);

            var _controller = complexFormController(_view, _validator);

            // act
            var formSubmitted = _view.form.submit();

            // assert
            expect(formSubmitted).to.be.false;

            _validator.isValid.restore();
        });
    });
});

describe('validator', function() {

    describe('.isValid()', function() {
        it("should return false and receive the message 'Name is required' if name field is empty", function() {
            // arrange
            var _view = view(dataTablesFactory, selectableTableFactory, reorderableTableFactory);

            sinon.stub(_view.form, 'getNameValue');
            _view.form.getNameValue.returns('');

            amplify.subscribe('validation.notValid', validationNotValidSubscription);

            var _validator = formValidator(_view);

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
            var _view = view(dataTablesFactory, selectableTableFactory, reorderableTableFactory);

            sinon.stub(_view.form, 'getNameValue');
            _view.form.getNameValue.returns('Some name');
            sinon.stub(_view.selectedItemsTable, 'getNodes');
            _view.selectedItemsTable.getNodes.returns([]);

            amplify.subscribe('validation.notValid', validationNotValidSubscription);

            var _validator = formValidator(_view);

            // act
            var isValid = _validator.isValid();

            // assert
            expect(isValid).to.be.false;

            function validationNotValidSubscription(validationMessage) {
            	expect(validationMessage).to.be.equal('Must have at least one item selected');
            }

            _view.form.getNameValue.restore();
            _view.selectedItemsTable.getNodes.restore();
            amplify.unsubscribe('validation.notValid', validationNotValidSubscription);
        });

		it("should return false and receive the message 'Maximum number for selected items is 50' if none item is selected", function() {
			// arrange
            var _view = view(dataTablesFactory, selectableTableFactory, reorderableTableFactory);

            sinon.stub(_view.form, 'getNameValue');
            _view.form.getNameValue.returns('Some name');

            var exceededNodes = [];
            exceededNodes.length = 51;

            sinon.stub(_view.selectedItemsTable, 'getNodes');
            _view.selectedItemsTable.getNodes.returns(exceededNodes);

            amplify.subscribe('validation.notValid', validationNotValidSubscription);

            var _validator = formValidator(_view);

            // act
            var isValid = _validator.isValid();

            // assert
            expect(isValid).to.be.false;

            function validationNotValidSubscription(validationMessage) {
            	expect(validationMessage).to.be.equal('Maximum number of selected items is 50');
            }

            _view.form.getNameValue.restore();
            _view.selectedItemsTable.getNodes.restore();
            amplify.unsubscribe('validation.notValid', validationNotValidSubscription);
		});
    });
});
