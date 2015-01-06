describe('ComplexFormController', function() {
    it('shold not submit form when it is invalid', function() {
        var result = ComplexFormController.submitForm({ preventDefault: function () {} });

        expect(result).to.be.false;
    });
});