define(["debug", "dom", "client", "alerts", "router"], 
function(debug, dom, client, alerts, router) {
	
	var log = debug.log;
	var debug = debug.rules;

	var Rules = function() {}
	
	Rules.prototype.listen = function(mrouter) {
		mrouter.listen("ruleSetResponse", this.assignRuleSet);
		mrouter.listen("ruleSetListResponse", this.displayRuleSetList);
		mrouter.listen("confirmRuleSetClick", this.confirmRuleSetClick);
		mrouter.listen("cancelRuleSetClick", this.cancelRuleSetClick);
		mrouter.listen("saveRuleSetClick", this.saveRuleSetClick);
		mrouter.listen("loadRuleSetClick", this.loadRuleSetClick);
		mrouter.listen("deleteRuleSetClick", this.deleteRuleSetClick);
		mrouter.listen("ruleInput", this.modifyRuleSet);
	}
	
	Rules.prototype.assignRuleSet = function(data) {
		client.ruleSet = data;
		Rules.prototype.displayRulesEditor();
	}
	
	Rules.prototype.displayRulesEditor = function(data) {
		if(debug) log("[Rules] displayRulesEditor");
		var html = "<ul>";
		for(var i in client.ruleSet) {
			html += "<li class=\"rule\" data-name=\"" + i +
			 "\">" + i + "--" + client.ruleSet[i] + "</li>";
		}
		html += "</ul>";
		dom.rulesEditorScreen.innerHTML = html;
	}
	
	Rules.prototype.displayRuleSetList = function(data) {
		var html = "<table>" +
		"<tr>" +
		"<th>File name</th>" +
		"<th>Author</th>" +
		"</tr>";
		for(var i in data) {
			html += "<tr>" + 
			
			"<td class=\"rule-set\"" + 
			"data-name=\"" + data[i].file_name + 
			"\" >" + data[i].file_name + "</td>" + 
			
			"<td>" + data[i].author + "</td>" + 
			
			"</tr>";
		}
		html += "</table>";
		dom.ruleSetList.innerHTML = html;
	}
	
	
	Rules.prototype.confirmRuleSetClick = function(data) {
		if(debug) log("[Rules] confirmRuleSet");
		// Apply any changes to the server's rule set
		client.emit("modifyRuleSet", client.ruleSet);
		router.route({name:"lobbyScreen", data:{isHost:true}});
	}
	
	Rules.prototype.cancelRuleSetClick = function(data) {
		if(debug) log("[Rules] cancelRuleSet");
		// Revert back to the session's rule set
		client.emit("getRuleSet", null);
		router.route({name:"lobbyScreen", data:{isHost:true}});
	}
	
	Rules.prototype.saveRuleSetClick = function(data) {
		if(debug) log("[Rules] saveRuleSet");
		alerts.showPrompt("Save rule set as:", function(resp) {
			if(resp) {
				client.emit("saveRuleSet", {
					filename:resp,
					ruleset:client.ruleSet
				});
			}
		});
	}
	
	Rules.prototype.loadRuleSetClick = function(data) {
		if(debug) log("[Rules] loadRuleSet");
		alerts.showPrompt("Load rule set:", function(resp) {
			if(resp) {
				client.emit("loadRuleSet", resp);
			}
		});
	}
	
	Rules.prototype.deleteRuleSetClick = function(data) {
		if(debug) log("[Rules] deleteRuleSet");
		client.emit("deleteRuleSet", data);
	}
	
	Rules.prototype.modifyRuleSet = function(data) {
		if(debug) log("[Rules] Attempting to change " + data.name + 
		" to " + data.value);
		validChange(data.name, data.value);
		Rules.prototype.displayRulesEditor();
	}
	
	function validChange(ruleName, value) {
		if(ruleName === "friendlyFire") {
			client.ruleSet[ruleName] = (value == "true");
		} else {
			client.ruleSet[ruleName] = value;
		}
	}
	
	
	return new Rules();
	
});