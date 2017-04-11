define(["debug", "dom", "client", "router"], function(debug, dom, client, router) {
	
	var log = debug.log;
	var debug = debug.rules;

	var Rules = function() {}
	
	Rules.prototype.listen = function(mrouter) {
		mrouter.listen("ruleSetResponse", this.displayRulesEditor);
		mrouter.listen("confirmRuleSetClick", this.confirmRuleSetClick);
		mrouter.listen("cancelRuleSetClick", this.cancelRuleSetClick);
		mrouter.listen("saveRuleSetClick", this.saveRuleSetClick);
		mrouter.listen("loadRuleSetClick", this.loadRuleSetClick);
	}
	
	Rules.prototype.displayRulesEditor = function(data) {
		log("displayRulesEditor");
	}
	
	
	Rules.prototype.confirmRuleSetClick = function(data) {
		log("confirmRuleSet");
	}
	
	Rules.prototype.cancelRuleSetClick = function(data) {
		log("cancelRuleSet");
		router.route({name:"lobbyScreen", data:{isHost:true}});
	}
	
	Rules.prototype.saveRuleSetClick = function(data) {
		log("saveRuleSet");
	}
	
	Rules.prototype.loadRuleSetClick = function(data) {
		log("loadRuleSet");
	}
	
	return new Rules();
	
});