define(["debug", "dom", "client", "router"], function(debug, dom, client, router) {
	
	var log = debug.log;
	var debug = debug.rules;

	var Rules = function() {}
	
	Rules.prototype.listen = function(mrouter) {
		mrouter.listen("ruleSetResponse", this.assignRuleSet);
		mrouter.listen("confirmRuleSetClick", this.confirmRuleSetClick);
		mrouter.listen("cancelRuleSetClick", this.cancelRuleSetClick);
		mrouter.listen("saveRuleSetClick", this.saveRuleSetClick);
		mrouter.listen("loadRuleSetClick", this.loadRuleSetClick);
		mrouter.listen("ruleInput", this.modifyRuleSet);
	}
	
	Rules.prototype.assignRuleSet = function(data) {
		client.ruleSet = data;
		Rules.prototype.displayRulesEditor();
	}
	
	Rules.prototype.displayRulesEditor = function(data) {
		log("displayRulesEditor");
		var html = "<ul>";
		for(var i in client.ruleSet) {
			html += "<li id=\"" + i + "\" class=\"rule\">" + 
			i + "--" + client.ruleSet[i] + "</li>";
		}
		html += "</ul>";
		dom.rulesEditorScreen.innerHTML = html;
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
	
	Rules.prototype.modifyRuleSet = function(data) {
		log("Attempting to change " + data.name + 
		" to " + data.value);
		client.emit("modifyRuleSet", data);
	}
	
	return new Rules();
	
});