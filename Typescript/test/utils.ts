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