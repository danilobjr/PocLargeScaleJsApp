function validationMessagesController(view) {
    var _view = view;
    init();
    var api = {
        showMessage: showMessage,
        hideMessage: hideMessage
    };
    return api;
    function init() {
        registerEvents();
    }
    function registerEvents() {
        _view.validationMessage.onDismiss(hideMessage);
    }
    function hideMessage() {
        _view.validationMessage.hide();
    }
    function showMessage(topic) {
        hideMessage();
        _view.validationMessage.showElementById(topic);
    }
}
