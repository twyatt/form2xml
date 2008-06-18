window.documents = {
	'document':document
};

/*
new Document()

creates a new document object (TODO make this work with IE) and extend it with some new methods
 */
var Document = function(name){
	window.documents[name] = document.implementation.createDocument("", "", null);
	return Object.extend(window.documents[name], Document.Methods)
};

Document.Methods = {
	observe: function(event, handler){
		Event.observe(this, event, handler)
		return this;
	},
	serializeToString: function(){
		return new XMLSerializer().serializeToString(this)
	},
	evaluateXpath: function(xpath){
		return this.evaluate(
		    xpath.toLowerCase(),
		    this,
		    null, XPathResult.ANY_TYPE, null 
		)
	},
	getElementsViaXpath: function(xpath){
		var iterator = this.evaluateXpath(xpath);
		
		var elements = [iterator.iterateNext()];
		
		while(elements.last()) elements.push(iterator.iterateNext())

		elements.pop();

		return elements
	},
	getFirstElementViaXpath: function(xpath){
		return this.evaluateXpath(xpath).iterateNext();
	}
};

Object.extend(document,Document.Methods)


Object.extend(Form.Methods,{
	getElementsWithAttribute: function(form, attribute){
		return form.getElements().findAll(function(element){
			return (element.hasAttribute(attribute));
		})
	},
	pullFromDocuments: function(form){
		form.getElementsWithAttribute('ref').each(function(element){
			var node = element.referencedNode();
			if (!node) return
			element.setValue(node.textContent);
		})
	},
	pushToDocuments: function(form){
		form.getElementsWithAttribute('ref').each(function(element){
			var node = element.referencedNode();
			if (!node) return
			node.textContent = element.getValue();
		})
	}
})

Object.extend(Form.Element.Methods,{
	referencedNode: function(element){
		if (!element.hasAttribute('ref')) return null;
		var xpath = element.getAttribute('ref');
		var doc = document;
		if (xpath.indexOf(':') > -1){
			var pair = xpath.split(':');
			doc = window.documents[pair[0]];
			if (!doc) return null
			xpath = pair[1];
		}
		return doc.getFirstElementViaXpath(xpath)
	}
})


// It turns out raio elements are not intended to work this way. see w3c.
// /*
//  * This is a significant change to the way Forms are serialized. This change treats inputs of type radio
//  * as if they were one object. This allows one to use the same data pulled from a form with From.serialize
//  * to be pushed back onto that form. 
//  */
// Object.extend(Form.Element.Serializers, {
//   // this change separates the handler for checkbox and radio
//   input: function(element, value) {
//     switch (element.type.toLowerCase()) {
//       case 'checkbox':
// 		return Form.Element.Serializers.inputSelector(element, value);
//       case 'radio':
//         return Form.Element.Serializers.inputRadio(element, value);
//       default:
//         return Form.Element.Serializers.textarea(element, value);
//     }
//   },
// 
//   // this is a new input of typeo radio element handler that treats a collection of radio buttons
//   // as one object allowing you to say form.elementName.value = 'someValue' and if a radio button
//   // of that name has that value it gets selected. 
//   inputRadio: function(element, value) {
// 	var elements = element.form.getElementsBySelector('input[type="radio"][name="'+element.name+'"]');
// 	if (value === undefined){
// 		return elements.inject(null, function(value, element) {
// 			return element.checked? element.value : value;
// 		});
// 	}else{
// 		if (value == true || value == false){
// 			element.checked = value;
// 		}else{
// 			elements.each(function(element) {
// 				if (element.value == value) element.checked = true;
// 			});
// 			return element;
// 		}
// 	}
//   }
// });

Element.addMethods();



