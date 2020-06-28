function showTradersTool() {
    var searchAroundPort = null;
    var searchDistance = 0;

    var suggestions = [];
    var portSuggestions = [];

    var nationSelector = [];
    var nationsEnabled = [];
    for (var i = 0; i < Nations.Nations.length; i++) {
        nationSelector.push(
            {
                view: "toggle", label: Nations.Nations[i].Name, value: 1, onIcon: "check-square-o", offIcon: "square-o", type: "icon", id: "nationSelector_" + i.toString(),
                on: {
                    onChange: function (value, obj) {
                        for (var i = 0; i < nationsEnabled.length; i++) {
                            nationsEnabled[i] = $$('nationSelector_' + i.toString()).getValue() == 1;
                        }
                        setupData();
                    }
                }
            });
        nationsEnabled.push(true);
    }

    var templateNames = [];
    for (var t in ItemTemplates) {
        //  if (ItemTemplates[t].__type.indexOf("MaterialTemplate") != -1
        //      || ItemTemplates[t].__type.indexOf("ResourceTemplate") != -1) {
        suggestions.push(ItemTemplates[t].Name);
        templateNames.push(ItemTemplates[t].Name);
        //}
    }

    var shopNames = [];
    for (var p in Shops) {
        suggestions.push(getPortFromId(Shops[p].Id).Name);
        shopNames.push(getPortFromId(Shops[p].Id).Name);
        portSuggestions.push(getPortFromId(Shops[p].Id).Name);
    }

    function skipPort(id) {
        var port = getPortFromId(id);

        if (!nationsEnabled[port.Nation]) {
            return true;
        }

        if (searchAroundPort == null) {
            return false;
        }

        if (distance_XY(searchAroundPort.sourcePosition, port.sourcePosition) > searchDistance) {
            return true;
        }

        return false;
    }

    var setupItemData = function (itemName, showAlways) {
        var itemId = 0;
        var info = "";
        info += "<td>" + itemName + "</td>";

        var item = getItemTemplateFromName(itemName, "Recipe");
        if (item == null)
            return "";

        var seller = [];
        var buyer = [];

        var max_sell = -1;
        var min_buy = 99999;

        // consumed
        info += "<td>";
        info += "<ul class=\"list-group\">";
        for (var i = 0; i < Shops.length; i++) {
            if (skipPort(Shops[i].Id)) continue;
            for (var p = 0; p < Shops[i].ResourcesConsumed.length; p++) {

                if (Shops[i].ResourcesConsumed[p].Key == item.Id) {
                    info += " <span class=\"label label-default\">" + "<span class=\"label label-success label-pill pull-xs-left\">"
                        + item.PortPrices.Consumed.SellPrice.Min /*(Shops[i].ResourcesConsumed[p].Value * 24)*/ + "</span> " + getPortFromId(Shops[i].Id).Name + "</span> ";

                    var modifiedSell = item.PortPrices.Consumed.SellPrice.Max * (1 - getPortFromId(Shops[i].Id).PortTax);
                    buyer.push({ price: modifiedSell, portID: Shops[i].Id });

                    // if(item.PortPrices.Consumed.SellPrice.Min > max_sell){
                    //     max_sell = item.PortPrices.Consumed.SellPrice.Min;
                    // }
                    break;
                }
            }
        }
        info += "</ul></td>";

        // available
        info += "<td>";
        info += " <span class=\"label label-default\">"
            + "<span class=\"label label-warning label-pill pull-xs-left\">" + "available" + "</span> "
            + "<span class=\"label label-danger label-pill pull-xs-left\">" + "cost" + "</span> "
            + "<span class=\"label label-other label-pill pull-xs-left\">" + "wanted" + "</span> "
            + "<span class=\"label label-info label-pill pull-xs-left\">" + "sells for" + "</span> "
            + "port name" + "</span> ";
        info += "<br/>";
        info += "<br/>";

        info += "<ul class=\"list-group\">";
        for (var i = 0; i < Shops.length; i++) {
            if (skipPort(Shops[i].Id)) continue;

            for (var p = 0; p < Shops[i].RegularItems.length; p++) {
                if (Shops[i].RegularItems[p].TemplateId == item.Id) {
                    var amount = Shops[i].RegularItems[p].Quantity;                            
                    var sellPrice = Shops[i].RegularItems[p].SellPrice;
                    var buyPrice = Shops[i].RegularItems[p].BuyPrice;
                    var tax = getPortFromId(Shops[i].Id).PortTax;
                    var modifiedBuy = buyPrice + buyPrice * tax;
                    var modifiedSell = sellPrice - sellPrice * tax;
                    var wanted = Shops[i].RegularItems[p].SellContractQuantity;

                    if (amount > 0) {
                        seller.push({ price: modifiedBuy, portID: Shops[i].Id });
                    }
                    
                    if(amount<0){
                        amount = Shops[i].RegularItems[p].BuyContractQuantity;
                    }
                    
                    if(amount < 0)
                        amount = 0;
                    if(wanted < 0)
                        wanted = 0;

                    buyer.push({ price: modifiedSell, portID: Shops[i].Id })

                    // if(sellPrice > max_sell){
                    //     max_sell = sellPrice;
                    // }

                    // if(modifiedBuy < min_buy && amount > 0)
                    // {
                    //     min_buy = modifiedBuy;
                    // }


                    info += " <span class=\"label label-default\">"
                        + "<span class=\"label label-warning label-pill pull-xs-left\">" + amount + "</span> "    
                        + "<span class=\"label label-danger label-pill pull-xs-left\">" + buyPrice + "</span> "                        
                        + "<span class=\"label label-other label-pill pull-xs-left\">" + wanted + "</span> "
                        + "<span class=\"label label-info label-pill pull-xs-left\">" + sellPrice + "</span> "
                        + getPortFromId(Shops[i].Id).Name + "</span> ";

                    break;
                }
            }
        }
        info += "</ul></td>";

        var max_profit = 0;
        var max_profit_name = "";
        var max_profit_dist = 0;
        var max_profit_dist_name = "";
        for (var b = 0; b < buyer.length; b++) {
            for (var s = 0; s < seller.length; s++) {
                var profit = buyer[b]["price"] - seller[s]["price"];
                if (profit > max_profit) {
                    max_profit = profit;
                    max_profit_name = getPortFromId(seller[s]["portID"]).Name + "->" + getPortFromId(buyer[b]["portID"]).Name;
                }
                var profit_dist = 1000 * profit / distance_XY(getPortFromId(buyer[b]["portID"]).sourcePosition, getPortFromId(seller[s]["portID"]).sourcePosition)
                if (profit_dist > max_profit_dist) {
                    max_profit_dist = profit_dist;
                    max_profit_dist_name = getPortFromId(seller[s]["portID"]).Name + "->" + getPortFromId(buyer[b]["portID"]).Name;
                }
            }
        }

        info += "<td>" + max_profit.toFixed(0) + "</td>";
        info += "<td>" + max_profit_name + "</td>";
        info += "<td>" + max_profit_dist.toFixed(2) + "</td>";
        info += "<td>" + max_profit_dist_name + "</td>";

        if (max_profit > 0 || showAlways)
            return "<tr>" + info + "</tr>";
        return "";
        //document.getElementById("results").innerHTML += "<tr>" + info + "</tr>";
    };

    var setupShopData = function (portName) {
        var info = "";
        info += "<h1>" + portName + "</h1>";

        var port = getPortFromName(portName);
        var portShop = getShopFromId(port.Id);

        // Produces
        info += "<h3>Produces</h3>";
        for (var p = 0; p < portShop.ResourcesProduced.length; p++) {
            var item = getItemTemplateFromId(portShop.ResourcesProduced[p].Key);
            var amount = portShop.ResourcesProduced[p].Value * 24;
            info += " <span class=\"label label-default\">" + "<span class=\"label label-success label-pill pull-xs-left\">" + amount + "</span> " + item.Name + "</span> ";
        }

        // Consumes
        info += "<h3>Consumes</h3>";
        info += "<ul class=\"list-group\">";
        for (var p = 0; p < portShop.ResourcesConsumed.length; p++) {
            var item = getItemTemplateFromId(portShop.ResourcesConsumed[p].Key);
            var amount = portShop.ResourcesConsumed[p].Value * 24;
            info += " <span class=\"label label-default\">" + "<span class=\"label label-warning label-pill pull-xs-left\">" + amount + "</span> " + item.Name + "</span> ";
        }
        info += "</ul>";

        // Stock
        info += "<h3>Stock</h3>";
        info += " <span class=\"label label-default\">"
            + "<span class=\"label label-warning label-pill pull-xs-left\">" + "available" + "</span> "
            + "<span class=\"label label-danger label-pill pull-xs-left\">" + "cost" + "</span> "
            + "<span class=\"label label-other label-pill pull-xs-left\">" + "wanted" + "</span> "
            + "<span class=\"label label-info label-pill pull-xs-left\">" + "sells for" + "</span> "
            + "item name" + "</span> ";
        info += "<br/>";
        info += "<br/>";

        info += "<ul class=\"list-group\">";
        for (var p = 0; p < portShop.RegularItems.length; p++) {
            var item = getItemTemplateFromId(portShop.RegularItems[p].TemplateId);
            var amount = portShop.RegularItems[p].Quantity;
            var sellPrice = portShop.RegularItems[p].SellPrice;
            var buyPrice = portShop.RegularItems[p].BuyPrice;
            var wanted = portShop.RegularItems[p].SellContractQuantity;
            
            if(amount<0){
                amount = Shops[i].RegularItems[p].BuyContractQuantity;
            }
            
            if(amount < 0)
                amount = 0;
            if(wanted < 0)
                wanted = 0;

            info += " <span class=\"label label-default\">"
                + "<span class=\"label label-warning label-pill pull-xs-left\">" + amount + "</span> "    
                + "<span class=\"label label-danger label-pill pull-xs-left\">" + buyPrice + "</span> "                        
                + "<span class=\"label label-other label-pill pull-xs-left\">" + wanted + "</span> "
                + "<span class=\"label label-info label-pill pull-xs-left\">" + sellPrice + "</span> "
                + item.Name + "</span> ";
        }
        info += "</ul>";

        return info;
    };

    function setupData() {
        var content = "<table id=\"myTable2\" style=\"width:100%\"><tr><th onclick=\"sortTable(0)\">Item</th><th>Consumed</th><th>Available</th><th onclick=\"sortTableNumeric(3)\">Profit</th><th>Ports</th><th onclick=\"sortTableNumeric(5)\">Profit/Dist</th><th>Ports</th></tr>";
        document.getElementById("results").innerHTML = "";

        var name = $$('searchCombo').getValue();
        var searchAround = $$('searchAroundCombo').getValue();
        var distance = $$('radiusSlider').getValue();

        searchAroundPort = getPortFromName(searchAround);
        searchDistance = distance_XY({ x: -4096, y: -4096 }, { x: 4096, y: 4096 }) * (distance / 100.0) * (distance / 100.0);

        console.log(name + ", " + searchAround + ", " + searchDistance);


        if (templateNames.indexOf(name) != -1) {
            content += setupItemData(name, true);
            showItemFilters(true);
        }
        else if (shopNames.indexOf(name) != -1) {
            content += setupShopData(name);
            showItemFilters(false);
        }
        else {
            showItemFilters(true);
            for (var t in ItemTemplates) {
                // if (ItemTemplates[t].ItemType == "Resource"
                //     || ItemTemplates[t].ItemType == "Material") {
                content += setupItemData(ItemTemplates[t].Name, false);
                //}
            }
        }

        content += "</table>"
        document.getElementById("results").innerHTML = content;
    }

    //console.info(shopsData);
    webix.ui(
        {
            container: "search",
            rows:
                [
                    {
                        cols:
                            [
                                {
                                    view: "combo", label: "Port or item name:", labelWidth: 150, suggest: suggestions, id: "searchCombo",
                                    on: {
                                        onChange: function () {
                                            setupData();
                                        }
                                    }
                                }
                            ]
                    },
                    {
                        cols:
                            [
                                {
                                    view: "combo", label: "Search around port:", labelPosition: "left", labelWidth: 150, value: "Gustavia", suggest: portSuggestions, id: "searchAroundCombo",
                                    on: {
                                        onChange: function () {
                                            var name = $$('searchAroundCombo').getValue();
                                            setupData();
                                        }
                                    }
                                },
                                {
                                    view: "slider", type: "alt", label: "Search distance:", labelWidth: 150, value: "5", id: "radiusSlider", on:
                                    {
                                        onChange: function () {
                                            setupData();
                                        }
                                    }
                                }
                            ]
                    },
                    {
                        cols: nationSelector
                    }
                ]
        });

    function showItemFilters(show) {
        if (show) {
            $$('searchAroundCombo').enable();
            $$('radiusSlider').enable();
            for (var i = 0; i < nationSelector.length; i++) {
                $$('nationSelector_' + i.toString()).enable();
            }
        } else {
            $$('searchAroundCombo').disable();
            $$('radiusSlider').disable();
            for (var i = 0; i < nationSelector.length; i++) {
                $$('nationSelector_' + i.toString()).disable();
            }
        }
    }
    showItemFilters(false);
    setupData();
}