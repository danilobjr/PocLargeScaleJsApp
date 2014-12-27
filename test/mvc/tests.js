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

            sinon.stub(_view.form, 'isValid');
            _view.form.isValid.returns(false);

            var _controller = complexFormController(_view);

            // act
            var formSubmitted = _view.form.submit();

            // assert
            expect(formSubmitted).to.be.false;

            _view.form.isValid.restore();
        });
    });
});

describe('validator', function() {

    describe('.isValid()', function() {

        it("should return false and the message 'Name is required' if name field is empty", function() {
            // arrange
            var _view = view(dataTablesFactory, selectableTableFactory, reorderableTableFactory);

            sinon.stub(_view.form, 'getNameValue');
            _view.form.getNameValue.returns('');

            var sinon.spy();

            var _validator = validator(_view);

            // act
            var isValid = _validator.isValid();

            // assert
            expect(isValid).to.be.false;

            _view.form.getNameValue.restore();
        });

        it('should return false if none item is selected', function() {
            // arrange
            var _view = view(dataTablesFactory, selectableTableFactory, reorderableTableFactory);

            sinon.stub(_view.form, 'getNameValue');
            _view.form.getNameValue.returns('Some name');
            sinon.stub(_view.form, 'getItemsFromSelectedItemsTable');
            _view.form.getItemsFromSelectedItemsTable.returns([]);

            var _validator = validator(_view);

            // act
            var isValid = _validator.isValid();

            // assert
            expect(isValid).to.be.false;

            _view.form.getNameValue.restore();
            _view.form.getItemsFromSelectedItemsTable.restore();
        });
    });
});

// describe('validationMessages', function  () {


//     it(' should show validation massage on submit', function  () {

//     });
// });