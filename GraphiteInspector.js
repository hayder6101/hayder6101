/*
* IBM Confidential
* OCO Source Materials
* 5724-U18, 5737-M66
* (C) COPYRIGHT IBM CORP. 2023
* The source code for this program is not published or otherwise
* divested of its trade secrets, irrespective of what has been
* deposited with the U.S. Copyright Office.
*/

/*jshint -W099 */
/*jshint -W069 */
/*jshint scripturl:true*/
/*jshint loopfunc:true */
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/query",
        "dojo/dom-attr",
        "dojo/dom-style",
        "dojo/_base/array",
        "dojo/on",
		"dojo/dom-geometry",
        "dojo/_base/event",
        "dijit/registry",
        "dojo/dom",
        "dojo/dom-class",
        "dojo/_base/window",
        "dojo/aspect",
		"dijit/Dialog",
        "dojox/gesture/tap",
        "dojo/touch",
        window.inspectorBaseUrl+'/Inspector.js'],
        function(declare, lang, query, attr, style, array, onEvent, geom, event, registry, dom, domClass, win, aspect, tap, touch, Dialog, Inspector){
  return declare([Inspector], {
	bindMethods: [],
	markerMethods: [],
	commentClasses: [],
	clickEvent: tap,
	dataId: "graphiteInspectorData",
    assertionAttributes: {"a":["href", "title","innerText","textContent"],"input":["value", "readonly", "checked", "placeholder", "aria-required"],"img":["src", "readonly"],"button":["textContent","aria-label","className"],"label":["innerHTML","className","textContent"],"span":["innerHTML","innerText","textContent","title","className"], "text":["textContent"], "div":["textContent","style","title","innerText","innerHTML","className"], "h1":["textContent","innerText"], "h2":["textContent"], "h3":["textContent"], "h4":["textContent"], "textarea":["innerHTML", "value"], "select":["value"], "li":["innerText","textContent","className"],"p":["innerText","textContent"],"svg":["textContent","style","outerHTML","description","fill","title"],"iframe":["title"], "td":["innerHTML","innerText","textContent"], "th":["className","textContent"]},
    constructor: function(){
 		console.log("Graphite Inspector starting.");
 		var insp = this;
        
        // Options for the observer (which mutations to observe)
        var config = {attributes: false, childList: true, subtree: true};

        // Callback function to execute when mutations are observed
        var callback = function(mutationsList, observer) {
        for (var mutation of mutationsList) {
            if (mutation.type == 'childList') {
            console.log('A child node has been added or removed.', mutation);
            insp.addInspectionPoints();
            }
        }
            
        let mList = document.getElementById('#modal_root');
        config = {childList: true};
        var callback = function(mutationsList, observer) {
        for (let mutation of mutations){
          if (mutation.type === 'childList')
            console.log('A child node has been added or removed.', mutation);
            insp.addInspectionPoints();
          }
      }
        observer.observe(mList, config);
    };
    
      // Create an observer instance linked to the callback function
      var observer = new MutationObserver(callback);

      // Start observing the target node for configured mutations
      observer.observe(document.getElementById('root'), config);
 		insp.startWidth = "600px";
    	this.extendedButtons = [ ];
    	this.commentCheck = false;
        this.resources.strings.verify_toast_displayed="Verify Toast Displayed";
        this.resources.strings.verify_toast_message="Verify Toast Message";
		this.resources.strings.get_toast_message="Get Toast Message";
        this.resources.strings.toast_message="Message";
		this.resources.strings.verify_notification="Verify Notification Message";
		this.resources.strings.get_notification_message="Get Notification Message";
		this.resources.strings.notification_message="Notification Message";
		this.resources.strings.hover="Hover Over Element";
        this.resources.strings.rte="Type Into Rich Text Editor";
        this.resources.strings.set_checkbox_state="Set Checkbox State";
        this.resources.strings.checkbox_state="Checkbox State";
		this.resources.strings.checked="Checked";
		this.resources.strings.unchecked="Unchecked";
        this.resources.strings.checkbox_added_success="Checkbox state added to position";
		this.resources.strings.checkbox_state_added="Checkbox state selection was created for node '{0}'";
		this.interactionElements = [	{"query":"*[mx-listeners]","events":["click","keypress"]},
 		                            	{"query":"INPUT[type='text']","events":["click","change","keypress","keydown","mousedown"]},
 		                            	{"query":"BUTTON","events":["click"]},
                                        {"query":"LI","events":["click","keypress"]},
                                        {"query":"SPAN[class='bx--toggle__appearance']","events":["change","mouseup"]},
                                        {"query":"DIV[class='bx--list-box__menu-item']","events":["click","keypress"]},
                                        {"query":"DIV[class='bx--tile-content']","events":["click","keypress"]},
                                        {"query":"SVG","events":["mouseup","keypress"]},
                                        {"query":"DIV[role='listbox']","events":["click","keypress","change"]},
                                        {"query":"PATH","events":["click","keypress","mouseup"]},
                                        {"query":"DIV[class='flex-container']","events":["click","keypress"]},
                                        {"query":"DIV[class^='mce-menu-item']","events":["click","keypress"]},
                                        {"query":"INPUT[class='mce-textbox']","events":["click","change","keypress"]},
                                        {"query":"DIV[role='option']","events":["click","keypress"]},
                                        {"query":"BODY[id='tinymce']","events":["change","click","keypress"]},
                                        {"query":"DIV[class^='mce-edit-area']","events":["click","keypress"]},
                                        {"query":"DIV[class^='bx--select-input']","events":["change","click","keypress"]},
                                        {"query":"A","events":["click","keypress"]},
                                        {"query":"DIV[class='bx--form-item bx--checkbox-wrapper']","events":["click","change","keypress","keydown"]},
                                        {"query":"DIV[class='bx--form-item mx--label']","events":["click","change","keypress","keydown"]},
                                        {"query":"INPUT[role='combobox']","events":["click","change","keypress","keydown"]},
                                        {"query":"DIV[class^='bx--search']","events":["click","keypress","keydown"]},
                                        {"query":"DIV[class^='mx--datalist-flex']","events":["click","keypress","keydown"]},
                                        {"query":"P[class^='mx--label']","events":["click","mouseup"]},
                                        {"query":"INPUT[class^='bx--text-input']","events":["click","change","keypress","keydown"]},
                                        {"query":"INPUT[type='radio']","events":["click","keypress","change","keydown"]},
                                        {"query":"SPAN[role='listitem']","events":["click","keypress","keydown"]},
                                        {"query":"DIV[class='bx--form-item']","events":["click"]},
                                        {"query":"INPUT[type='number']","events":["click","keypress","change","keydown","mousedown"]},
                                        {"query":"DIV[class^='bx--dropdown']","events":["click","keypress"]},
                                        {"query":"TEXTAREA","events":["change","click","keypress"]},
                                        {"query":"DIV[class='bx--list-box__field']","events":["click","keypress"]},
                                        {"query":"BUTTON[class^='number__control']","events":["click","keypress"]},
                                        {"query":"SPAN[class^='bx--tag']","events":["click","keypress"]},
                                        {"query":"DIV[class^='mx--nav-tileview']","events":["click","keypress"]},
                                        {"query":"DIV[class^='mx--WrappedText bx--form-item']","events":["click","keypress","mousedown"]},
                                        {"query":"DIV[class='wrapped-text-container']","events":["click","keypress"]},
                                        {"query":"A[class^='bx--header__menu-item']","events":["click","keypress","mousedown"]},
                                        {"query":"A[data-testid^='suite-header-app-switcher']","events":["click","keypress","mousedown"]},
                                        {"query":"SPAN[class^='flatpickr-day']","events":["click","keypress","mousedown"]},
                                        {"query":"SPAN[class='arrowUp']","events":["click","keypress","mousedown"]},
                                        {"query":"SPAN[class='arrowDown']","events":["click","keypress","mousedown"]},
                                        {"query":"SPAN[class='flatpickr-prev-month']","events":["click","keypress","mousedown"]},
                                        {"query":"SPAN[class='flatpickr-next-month']","events":["click","keypress","mousedown"]},
                                        {"query":"DIV[class=^='tapTarget']","events":["click","keypress","mousedown"]},
                                        {"query":"BUTTON[class^='bx--number__control-btn]","events":["click"]},
                                        {"query":"P[class^='bx--label']","events":["click"]},
                                        {"query":"BUTTON[class='bx--modal-close']","events":["click"]},
                                        {"query":"P[class^='iot--progress-text-label']","events":["click","mousedown"]},
                                      
 		                           ];  
 		this.extendedButtons = [ {"label":this.resources.strings.verify_toast_displayed,"method":"verifyToastDisplayed","enabledCheck":function(){return dom.byId("UINotificationContainer").childNodes.length != 0;},"image":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAAB3RJTUUH3gwKEgUDtXEIewAAAAlwSFlzAAALEgAACxIB0t1+/AAAAARnQU1BAACxjwv8YQUAAAAqUExURQAAABBSnBBKlBBKjFqt1lKt1kqcxjml1jGUvQhapXO11tbn75S93ghzrVeLrzsAAAABdFJOUwBA5thmAAAAZ0lEQVR42o3QSw6AIAxFUcHXD0X3v12LVEFH3OFJWxK2bbEzKl5KnY7IDDyTAcw6k9XKX7JGqkovWTujKoOa1KoiElTaU/QjgKQTciefkZtIEFPm8lCfSmAn0Wkx+SlEFDTKeV/9rAtA9QWe/7wCPwAAAABJRU5ErkJggg=="},
        {"label":this.resources.strings.verify_toast_message,"method":"verifyToastMessage","enabledCheck":function(){return dom.byId("UINotificationContainer").childNodes.length !=0;},"image":"data:image/png;base64,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"},
        {"label":this.resources.strings.get_toast_message,"method":"getToastMessage","enabledCheck":function(){return dom.byId("UINotificationContainer").childNodes.length !=0;},"image":"data:image/png;base64,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"},
            
								 {"label":this.resources.strings.hover,"method":"hoverOverElement","image":"data:image/png;base64,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"},
                                 
                               {"label":this.resources.strings.rte,"method":"typeIntoRichTextEditor","image":"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSEhUTEhMWFhUWGBoYGBYYFxgYHBgeHRcYHRkaGB0aHygiGholHR4dITEiJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGzUlICEuNzczLisvKzctNTgwNSstNTcyKzU3MjcrKy83KysvLS8tLy0tLSs3Ny8tLS8tLS03Lf/AABEIALsBDQMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAADAAECBAUGB//EAEoQAAECBAIFBQwHBwMEAwAAAAECEQADEiEEMQUTIkFxFDJRYYEGFyNCVZGSk7HB0tMVFjNSU2KhVHKCoqPi8Qc04SRDstGDwvD/xAAaAQEAAwEBAQAAAAAAAAAAAAAAAwQFAQIG/8QALREBAAIBAwIFAgUFAAAAAAAAAAECAwQRQRIhBSIxUWET0XGBwfDxIzIzseH/2gAMAwEAAhEDEQA/APXJuKE8atIIJu5ytwhpM4YcULBJO1s+bfwiWKw6ZKa5dlZZvnxhsJKE4FU25BYbrMDu4mAGnCmWrXEgpzYZ3y9sSnJ5SxRamxq6+huEDlT1LXqlcxyGZrB2v2RPGHUMJVqnffllnAT5UKdQxqah9z5cWiMlPJ3K71WFPVxaJ8nTRrfHpqzObPlA8Gde4m3py3Z8IBlYYzFa4EBJYsc9m3uic6cMQKEOCNra827jAps9SF6pPMcBs7Fnv2mDYuUJICpdiSx32Ynf1gQDSsUJA1agSc3GV+MQl4YyDrFEECzDO/GJSkImI1k3PLNrCMrDzZ+LdyEyd6yGJI+708cuMBdxc5M7bCgkDZ2vPu4wCd3RSVJ1Lsea5ZrZ+yLOG0dIlhkorPSs1fobeYRbTObIAcBAY2H07Jw71KBqvs7m6X4x5tpTGmfOmTT46ipugeKOwMOyPQu7rSpRhigWVNNH8Oa/0t/FHnmjcIZ01EoeOoA9Q8Y9gc9kYnieSb3rij97t7wrHFMds1v3ssaQRL1Mgo54SRMyzKipP6EjsEWu5XT3JFrJBUhaWKQzuOab8SO2O+7o8Jr8MuUEhwl0AdKbpA4s3bHkwiHV47abLW1Pb/ifR5K6rDal/f8A33dvo7u2ly1FRlLNmtT0jr6oWN7tJUxb6uYAwHin3xqaA0dhZmGkq1EpRKEhSigElQDKfrqBi5O0DhFBjhpY/dBSfOkgxpVrqrVi0Xjv8My1tHW01mk9vkI91UjEJoSaSb7VmaJYfuikyBSpQUTfZI4b26I4tcs4HHpEsmkKSQ+9CmdJ6d47AY9OOIPQIl0ue2SJi8bTWdpQavT1xTW1J3raN4Y8jHSwoztYikOoh7gHjbfGRpzu2kqI1aFrpe9kg5by5/SMXurxysVi9VLyBCANxUHcnqBfzExqaMwUnDlKTLSqZcla0hT5MUg2SOF+mIpzZc15rh7RHrM/omjBhwUi+bvM+lY/UpP+oIo1asOQKaXEwKOXQUj2xt9z+mpKgVoVUbAoZlJ4g7usOIuTtD4ebJK1ykElJOW9tzZdkecaUwisHPSqWSxuh/5kHpHuI3x5vkz6fzXnqr+G0w9Y8Wn1Plxx02477xL0xeFM064EBJuxz2bH2ROdPGIFCQQRtbWVrbuMU8NpElKNWCEKCSEkXFQBIL73Ji7i5QkiqXYkt02z38BGhE7xuzZjadpKViRIFCgSc3GV+MDl4UyTrFEEDcM723wXCyEzk1zLqyzaw4QDDYhU1VC7pL7myyjric6UcQakWAttefc/TE1YkLTqQDVzX3OP8QPFrMkhMqwIc775b4LMw6Uo1o57VO+8527YCEk8meu9WVPV0vxiJwpKte4pett7C7dD2iWDGvfW3pZt2eeXAQNU9QXqhzHCWbcbG8AWcvlGyi1NzV/xDysYJI1agSU7wzXvv4w2MQJABlWJLHf7YnhsKiakLXzi73IyLC3AQAMPhjIVWtmytc3h8VJOINctmApva+fvhpGJM86tbAZ7Njbi8PiJxw5oQxBFW1cvlubogCTcSlaNSl6rC+Vs/ZEcKeTuJnjZNfKJTMMJadcHqzY5Xz9sRw6eUOV2pyptn0u/RAD5Ma9dah6+ts8umCYpXKGEvxbl7ZxDlRq1NqXo62y88ExCeTsUXqsar5dDNASlYlMtOqVzsrZXyv2wHCyThzXMZiKbXvn7jBZeGExOuU9WdsrZeyBSp5nuhbAAVbNi4tve14DNx0nleISkHwbOvcWG7tNvPGzMVuFkiwAijoWSECcob10h82AB9pMW4BQoUVdKYwSZS5p8RJI6z4o7Sw7Y5MxWN5drWbTERy4Du2x2sxJSObKFA45qPnt/DF//AE9wLrXOOSRQnibqPEBvTjklrJJJLkkknpJuTHqnc5gNRh5aCNpqlfvKuR2ZdkYWjic+pnJPHf7PoNdMafSxirz2+7TjyzunwGpxMxI5qjWngq/6Fx2R6nHD/wCow25B30r/AEKW9p88XfE6RbD1eyh4Vkmufp9/5Vu5TukRh0KlzQspepNIBZ+cC5FrA+eNmZ3cYcDZRNJ4IA7TVbzGOEwsxKVpUtNSQQVJvcPcW6o9JPcxg1BxKDEOClaxY5HnRV0eTUZMfTSY8vuu67FpseTqyVnze3o53Q2DmY7EnEzABLSoFnfmtSgDNrByc79Nu4xE2lKlfdSVeYPHnmm9Hr0fPQuSsspyknOxFSFNZQuPP1PHd4eaMRICgG1svLoqTcdhtFrRzt10mPPz8qeujq6MlZ8npHw4PuJk1YgqNylBL9ZID+Ynzx2U+S/URcEZg9Uch3CTGxCkmxVLIbrBSW8z+aO4WmPXhv8Ag/OXnxTf6/5QoYGcoTXmNsmp+kDeP/UbWKUMQ2rzTdzbPojJxWHC0kG3QRmOEBw+lhhWCyATZ1ZEbiMm7YvTMRG8s+ImZ2hvycSmWnVKeoOLXF7i/bAsLJMg1zGYim172PuieGlInoE+pyXOyRTs2DZ9HTEcPOOINC2AAq2bF7De/THXDYnDmea0MzNe2UGxGJTOTq0PUemwteBT8QZBoQxDPtXN+DQWdhhJGsQ9Q6bi9t0BHCzBhwUzMyXDXtl7oGjDFK9cWocq62OVu2CYeUMQCpdiC2zbr3v0wNGJKlaktS5TbNhl22gJYscobV+K7vbNm9kTGJSEam9bUdTm2fREcQeTtq71Z1XyyZm6YkMMCnXXqattzi/m7YCGFRyckzMlWDXiE/CKnKMxDUqyexsG9oieHXyhwu1NxTb2vEZ2MVJJloalOTu977j1wBsVOTMTTKurOwI43LQ2EmCUCmdZRLh9qzAbn3gw0zCiQNYkkkWY9cNLk8oFajSRssPPv4wA5UlSV6xf2bku72LtbtETxg1rGTcDNtnPLNoZOKMw6khhzX37P+IlMVyaydqq9+rhxgJ69NGr/wC5TSzHnN05Z73geDGqczrA5PtccnaJclDa9y7VtufNoaUrlNlbNN7dfGAHNkqUvWI+zcF3awZ7dhiekZiZqKZN1C5bZsx6W3kQysUZZ1IDjJ9+1f3wsVI5OmtJqfZY+fdwgKugJZThyFZ6xb798XYp6CnVyCohvCK9sXIBRx3+oWPZMuQDzttXAWSOBLn+ER2MeTadx+vnzJj2JZP7osnzi/bGf4ll6MXTHrZpeF4evN1T6VC0WqWJ0szfswoFTB7C7N1lh2x3/wBccL95XoKjiMBoHETkVy5dSXIepCcs+coRY+qeM/B/qS/ijN02TUYa+Sm8T8S1NVj02a39S+0xxvDr/rhhPvK9BUcx3Y6XlYhUoyiTSFAuCMyls+Biv9U8Z+D/AFJfxQvqnjPwf6kv4okzZtVlpNLU7T8Sjw4NHhvF65O8fMMWPQe5DTKDhgmbMQkyjTtKCXTmk3PRb+GOK0loqdh6RORTU7XSp2Z+aT0jzxHReGTNmolrVSFqpqZ2Jy85YdsVdNlyafLtt3nttK1qcWPUYvXtHfeO7a7stLJxExCJW0lDgEDnKU1k9OQHWTHcaIwplSJUs5pQAeLX7HeKOiO5mRh1BYdaxkpbFv3QAAOOcbUbmmwXre2XJ6z7MHVZ8dqVxYv7a+7zjT8pWExmtl5FQmDodT1JPHa7D1R2OjNLSsQkFChVvQSKh2bx1i0LFIkqmTkTwChaZbAg3YzHYjIhxfrjmcb3LSCXlYhh91aFFu0N7Ij+llwXm2KN6zwk+th1FIrlnptHLrMUtKBUtQSBvUQB+scHp3SBxc5KJQJSCyN1ROaj0C2/IAmDp7mATtYlPYhZP6tG9ovB4bDjYJKjmtQJPAWsOH6xzJXPqPJavTXnv3esd9PpvPW3VbjttAmhkKlFMlmCAGLsFZFShxLkjrjpMVNTNSEybqd7Cm3a3SIwJ82WsNUX3EAuD0i0G0NiTKBPOUDTewIN3G/dGhWsVjaOGZa02mZnltYWcmUmmbZWdwVW3XDwDDSVy1VzLIGd3zysILLwwxA1iiUnJh1cYgjFGcdWQADvGdrx1wsWgzSDJuAGLbN+1oLMnJUjVp+0ZmY5jO/n3wOZN5Psp2n2r+bdwiRwoQNcCSec26/+YBsGdU+us/NfayzydsxA1SVlesH2b1O/i5m2eW5oJLHKeds09G9+PCInFEHUNbmPvY2eAnjFiaAJNyLltm3a0Tw2IRLSETCyw72JzLi46mgcxHJtpO1Va/8AxDy8GJw1hJBVuGVre6AHhkrCnnPR+YuH3WMPiwpR8A9LXoLB+zezRLlXKPBtS93d8uq0LX8m2Grfafm9Tb+iAnNUgoZDa1t1lP41+nOIYRkvr8/FrvxZ+yG5Lq/DO7bVLNnuft6IenlN+ZTb7zv5mygB0rre+qd89mnh0NBMWym1GfjUW4OzQ3Kv+w35Kn7Hb3PD08mvz6rfdZvPATkqQENMbW3zup91+nKK0oKS5nvS1qy4fte7PBuS6zwzs96Wfm2zfq6IhOn8pBQ1DbT87qbd0wAtDFJkmlm1isuMWYqaCk0SCl38Iq+W+LcBjd1uP1OGWQWUvwaf4nc9iXPmjzFKSSAA5NgOknIR03d7j654lDKUL/vKYnzCnzmKvcXgdbiUkjZl7Z4jm/rf+GPn9Xac+pjHHHb7vpNFWNPpZyW57/Z6DozBiTKRKHiJAPWfGPaXPbFqFCjfrERG0PnLWm0zM8lChQo64wu7PAa3DKIG1L2xwHOHouewR5oI9nIfO4jyTTGB1E6ZK3JVbrSbpPmIjE8VxbWjJH4N7wjNvWcU8d3pug8fr5CJm8hlfvCyv1vwIi/HDf6faQZa5BNlbaeIDKHaGP8ACY7mNLSZvq4otyy9Zh+jmmvHBmhNDwosqpmhUiHhQCSkPFCwxswr+zoTndNXDpZ40E5iM2cjWYtcrLZSp89zM3bAXcUlZLyXobxCwfflBsSpBS0pq91IY53vA+U8n8G1W93pz6rw/JdR4V6m3M2ds3MA+EKUg69qntXct27neBoSut1PqnOZ2Wu1ujKJ6rlO09DbLc7rfd0wuVV+AZvFqfo3t2dMA2M2m1HXVRboZ2brggUihi2tZvzVNa/S8Qfk356/4WbzvnDclfw7/npbouz9mbQCwgKSde7bq736neB4hMwqJlVUbqSwyuwHW8Fr5Ts8ym/3n9kLluo8FTVTvdne+THpgJ4lKAl5LV/luW35Q2ECVDw7VPauxa3S1neIIwpkHWKLgWYdfGFMk8o207IGyx8+7jAQlKWVst9U5zDJa7X6Moni9ltRl41F+DtElYoTBqQCDzXOVv8AENLVyaytqq9urjxgJ0ooe2tZ/wA1TdHS8DwjqJ1+Xi124s8LkpfXvbntvbNuMPMVymydmm9+vhADmqWFsh9W4yDpaz36M4npEJSh5DVb6LlmPRudoknFCWNSQSRZxltX98CVI5OCtW0CKWHn38ICt3PlRkGp31is+MXTFXQc6uSpQt4RXti3Aee4juRxcxalq1dSiVHbOZLndHS9yehVYaWvWNWtV2L2A2Q/EqPbGVpbuKnzp0yanSeKlBaioS0LmBKPypAmgN2CKve/xHlfG+nN+dFTFosWO/XHquZtdly0+nO23w7yFHB97/EeV8b6c350Lvf4jyvjfTm/Oi2pu8hRwfe/xHlfG+nN+dC73+I8r4305vzoDvI5fut7nV4haJkqmoJpVUWsC6Wt1n9Iy+9/iPK+N9Ob86F3v8R5XxvpzfnRFmxVy16beiXDmthv119UcB3K4uVMRMTq3QoHnm/SMt4cdsd9HB97/EeV8b6c350Lvf4jyvjfTm/Ojzg09MMTFeXvUam+eYm/DvIUcH3v8R5XxvpzfnQu9/iPK+N9Ob86J1d3kKOD73+I8r4305vzo6HuX0FMwiVpmYudiayCDNKiUsGYVLVY9mUBuJzEZmLJGJWUc9kZXLMd3Q7RppzEZq16vGTJhuKUpYZ9PugNPCpQUvOav89i26x3QDDqWVNOejfUGHVeJzMMcQdYk0jJj1cIkvFCcNWAQTvOVrwEMWSkjUPS16Lh+tt7NBZiUUOlta27nPvt05xCXN5Psq2n2rebfwhhhSg64m3Obffd+sA+D2n1/wDDXbizt1QNSl1sH1TgZbNO+/Q0EmDlPN2aene/DhD8qAGoYu1D7nNngFiwEgajPfRe3WzxPDJllIM2mu71FjnZxwaBy0cmuraqtb/mIrwZnHWAgBW49VvdARws5UxVM26c8m4XDRLFrMo0ybJIcttXyzL7gIJPxInjVocE3vYW4PDYeaMOKF3JNWzcNlvbogJTZKUo1iB4RgXcm5ztlvMQwY1r665GT7OeeTRBGFMtWuLUuTbO+XtiWJTyhii1NjVbPoZ+iAhrlV6v/tvSzeLlnn2vBMYNUAZNic22uGbxLlIp1N6mofc7N5uyIYZPJ3K71WFN8ul2gCSZKVo1ix4S5dyLjK2W4RWlTFTXTNukBw4pvlubcTE5mFMxWuS1Lg3ztY+yHx04YhNCLEbW1YMxG573gK+hUBMlQTlrFde+LcUe5+UUSFJLPrFZcYvQHIaU0LpRc6YqTpBMuUVEoRqkmkbg5QXir9AaZ8qI9Uj4It6UOmddM1HJdVUdXW9VO6rriq+nujBfzQDfQGmfKiPVI+CF9AaZ8qI9Uj4Id9PdGC/mhPp7owX80A30Bpnyoj1SPghfQGmfKiPVI+CHfT3Rgv5oT6e6MF/NAN9AaZ8qI9Uj4IX0Bpnyoj1SPgh3090YL+aE+nujBfzQDfQGmfKiPVI+CF9AaZ8qI9Uj4Id9PdGC/mhPp7owX80A30Bpnyoj1SPghfQGmfKiPVI+CHfT3Rgv5oT6e6MF/NAN9AaZ8qI9Uj4I3+5nA4uUlYxmJGIUSCghITSGuLJDuYwX090YL+aN/ua5dSvl2pqcUap2Zru+94DaTmIzgkLxsxC+ZQk9F8s+BMaKMxGXiEazFLlpzZKr5MxHnvAX8XNVKVTKslnyqvxLwbEyUy01ywy7NcnPOxhpGIEgULcnPZuL8WgUnCmSdYtqR0Z34wBMGgTQTOuQWD7NuxoFLnKUvVq+zchmawdr59ESxEo4g1IYAW2rde5+mCLxIUnUh6mpvk4z7LQEcZ4JtTZ3qbayZs3bMxNMlBRrD9o1TuecBa2We6IYb/p3rvVlTfLpdumIHCkq11qXr62F/P2wD4NRmkidcC4fZ9jRDEYhctRRLsgZWfMObnreDYlfKAAixTc1W9jxKRjEyUiWp6k5tlcvv4wCxOGTITWh3Fr3zhsLKE8FczMGm1rWPvgWFkKlKrmWTlm+eWUPi5ZnGqVcAMd189/EQDS8SVr1Kmpci2dna/ZEsUrk7CX42b3y/wAwSbiErRqk89gO0Z37Ihg1ahxNtVlvy4QE+TJo1162r6nZ8uiB4VXKHEzxbhrZxDUKr1viPU77s8oLjFa9hKvTnuz4wA5uJMtWqS1LgXzuz37YfSEkSEVozOze9mJ90Fk4hKEatR27jJ7nK/aIrSpRkuqZYEUjffPd1AwFfuemlUhROesV7YvxU0LMCpSiMtYr2xbgOQ0ppvSiJ0xMnRyZktKiEL1qRUNxaq0VvrDpjyWn1yfig+le7WdJnTJSdG4qYEKKRMQiYUr60kSyG7Yq98Cf5JxvoTPlQE/rDpjyWn1yfihfWHTHktPrk/FEO+BP8k430JnyoXfAn+Scb6Ez5UBP6w6Y8lp9cn4oX1h0x5LT65PxRDvgT/JON9CZ8qF3wJ/knG+hM+VAT+sOmPJafXJ+KF9YdMeS0+uT8UQ74E/yTjfQmfKhd8Cf5JxvoTPlQE/rDpjyWn1yfihfWHTHktPrk/FEO+BP8k430JnyoXfAn+Scb6Ez5UBP6w6Y8lp9cn4oX1h0x5LT65PxRDvgT/JON9CZ8qF3wJ/knG+hM+VAT+sOmPJafXJ+KN7uZx+LnJWcXhhhyCAgBQVUGubEsxjnu+BP8k430Jnyo6DuY06vFpWpeFnYeggATQoFTh3FSU2EBuIzEZeIXq8SuYnnMlN8mYn3RqIzEZiFBGNmLVzaEp6b55dkBp4bDiemtbvlawtApGJM5WrW1J6LG0LFyFTlVy7pZuj2wfE4hM1NEu6i25ss7wAcVNOHNMvI3ve+Xugq8OlKNcHqarqc527YbCTBJBTNsSXG+zdUBRIUletPMcqd9xdrdsATC/8AUPrPFya2efsgasSQvU2oejrY2z6YnjPDtqr0u+7Nmz4GCDEJCNUee1OW8hheAjikDDgGXmqxe8Tw+ETOSJi3qVmxYWLe6BYNJkEmbYGw3+yB4jDKmqK0XScrtkGNuIgJysSZ51agADdxnbjDzpxw5oTcHav5t3CCYmYhaWktX+UUlt97Q2EUlAIn853FW0Wtxs7wDLwoljXAkqzY5X/zDSU8puu1OVPXxfoiEqWsLqW+rcm5cMXa3miWLdbajIc6nZ4PlANyo1ahhS9D72y88SnJ5PdF6rGrq4NE9Yiim2tZsr1N09L73geEBQ+vyPNq2uLZtASRhRMGuJIVmwy2bD2QHXHEAoVYAVOnqtv4xKahZXUh9W4yLBgz2fjEtIqStDSedmadksx4WdoCpoOSESlJH4is+MXYz+51KhJUFO+sVnffGhAcTpf/AFPwOGnTJEwTq5ailTCUzjoeaC3ECKnfh0d92f6Mn50bukP9QMBImLkzcQpK5ZpUkSp6mI3OlBB7DAO+do39qX6jE/LgMnvw6O+7P9GT86F34dHfdn+jJ+dGt3ztG/tS/UYn5cLvnaN/al+oxPy4DJ78Ojvuz/Rk/Ohd+HR33Z/oyfnRrd87Rv7Uv1GJ+XC752jf2pfqMT8uAye/Do77s/0ZPzoXfh0d92f6Mn50a3fO0b+1L9Riflwu+do39qX6jE/LgMnvw6O+7P8ARk/Ohd+HR33Z/oyfnRrd87Rv7Uv1GJ+XC752jf2pfqMT8uAye/Do77s/0ZPzoXfh0d92f6Mn50a3fO0b+1L9Riflwu+do39qX6jE/LgMnvw6O+7P9GT86Ok7lO6uRpFK14cLAlkJVWEC5DhqVK6OqKPfO0b+1L9RiflxsaC7o8PjUqVh5hmBBAU6JiGJDj7RIJ7IDURmIzAjWYyZLNhSlTjPo98aaM4yp4KsStKOeyTaxZjv6HaA0ZuIMg0JAIzc534QSbhRJGsSSSNxyvbdD4VaUJac1X5g5bde8Aw0taVVTXo3uXHVaALJlcoFSrEbOz59/GIJxJWrUkCl6XGdv8QsWlSyDIelmNJpv+m6CrmIKKUtrWawYvvv0574CE7/AKZqL1Z1dXQzdMOMKCnXuamrbc4v5obB7D6/fzatri2bboGpC66g+qd87U77dDbmgJyV8o2V2puKf+XhpmMMk6tIBCd5zvfdxieLIWAJGYzp2bfpE8NNQlITNasO7hzna/BoAZwuo8IDU1myzhJk8p2yaW2Wz633dMDwpXV4Z6Pz5PuziWLqfwD0tejJ+zezQD8q1ngWbxanfm9XZDlXJrDaqv0M3n6YnNoo2Kdawyap/G63ziGDa+vz8Wv9WfsgFyW2vf8APT+rPCSrlNjs036XfzQN1179U/8ADT7GaC4tmGoz8aj9HaAjyrV+BZ2tU7c6+XbEZ8jk6SsGp9lss7v+kGk0UeEp1t82qfd1vlFaVVfXvS1q8n7d7PAV9Azq5SizeEV7YvxR0KU6tVLNWrLLOL0BzuOx+i0zFicvBCaDthepqffVVd+MA+ktDff0f/Qi1je5vR8yYpc2TJMxRdRKrk73vnAfqnov8CR6X90AP6S0N9/R/wDQhfSWhvv6P/oQT6p6L/Akel/dC+qei/wJHpf3QA/pLQ339H/0IX0lob7+j/6EE+qei/wJHpf3Qvqnov8AAkel/dAD+ktDff0f/QhfSWhvv6P/AKEE+qei/wACR6X90L6p6L/Akel/dAD+ktDff0f/AEIX0lob7+j/AOhBPqnov8CR6X90L6p6L/Akel/dAD+ktDff0f8A0IX0lob7+j/6EE+qei/wJHpf3Qvqnov8CR6X90AP6S0N9/R/9CNbQmIwiwrkZkEAivU0M7Wqo3t0xm/VPRf4Ej0v7o1NDaLw2HChhkIQFEFVBdyMnuYDSRnGUZmrxUyZnZKWy3O79kaqc4ycMQcZMrailPOyfd2s8BqDDco8ITTubPKGGK1/gmpfe75dURxVVXgXobxMn35b4NiQinwVNe6ln68oAZm8m2QKn2ny6uvoh+S0eHd/Gp47n7YfCUsde1T2rzZtz7neBSyuvafVOc+a126mygCJHKc9mjtd/N0Q3Km8A35Kn6bO0LGbtR11UdjO3bBBRRenWt1VVNbrd4CCkcm2htVW6G9sJOC1/hXpq3M7NbPshsI7nX5bq+nqeB4gzKjqqqN1OWV2breAMrFa/wAGBS93zyhkzuTbBFT7Ti3V7oniZSEJqlNX1GotvteGwiEzATO5wLB9m1twbe8BAYXVnXO451PHr7YdaeU3GzTa93f/ABA5Uxal0LfVuRcMGDtduG+J4smW2oyPOba4Zu0A/Krahr8yr9HaEhPJrnaqtazNE9Uiiu2tZ871N0dL7mgeEJmPr8hzX2eOTPAI4XWHXAsDelvu290RxE/lCSgCltpzfqb9YU2YtK6EPq3AsHDFnv598S0ihMtDyedkW2rMeO9oDO0DKolqS77avbGnGR3PTFFCqs61bm3xrwHLaS/09wM+audMlrK5iipRC1AEnqGUVu9fo78JfrFRPSncGifOmTTi8UgrUVUoWAlL7khsoq97ZH7djPWJ+GAP3r9HfhL9YqF3r9HfhL9YqAd7ZH7djPWJ+GF3tkft2M9Yn4YA/ev0d+Ev1ioXev0d+Ev1ioB3tkft2M9Yn4YJhv8ATtCFoXy3FmlSVMZgY0kFjs5FmMBPvYaO/CX6xULvYaO/CX6xUdlCgON72Gjvwl+sVC72Gjvwl+sVHZQoDje9ho78JfrFQu9ho78JfrFR2UKA43vYaO/CX6xUbfc73N4fApWnDpKQsgqdRVcBhnlGvCgIzCwMY+Hl6zELli2ylT55Bm/WNOerdGdIJ1sxcvnApTa5YJvbjAa6cTyfwZFW9xbOGThTI8ITUBuAbO0EwstMxNU7nZXNJbda0Aw8xa1UzXo3uGHVdhAEVK5TtA0tssb9fvhziqxqGY82rhvbsiGLUZZAk80hywqv2vugsyUgIrS2sZ83LnO3n3QEEHk2e1X0WZv8wxwr+He3Ppbouz9kPg/CPr9zUvs555M+6BqmLroD6p2ytTvu2Tb3gCLXynZGzTe94dONEjwZFVO/LO/vhYtIlgGRmc22rdrxPDSULSFTWrLu5Y5sLW3NABk4YyDrFsQLMnO/FoU+ScQa0WA2drN89z9MRwuIVOVQu6c7Wyh8XNMg0y7Ah73vl7oAq8SJidSAasnOVs977uiIyFcmcLvVcU9XS7dMTm4dKEa1PPYHqc527Yhgxr3My9OTWzgI8lNWvtS9bb2z4P2xKerlDBFqbmrr6GeB8oVXqfEeht7ZZwTGJ1ABl2qsXvlASRiRLTqSCVZOGbay69/RANScOCtbEEU7Ob5726IsScOlaNarn3PVbK3ZFaVOM90zLgCq1r5e8wGfoWeFhRD89WfGNeOcweKTJqQkFRqUWfK+ZJyiyrGTFZrSkdCQ/wCp/wDUd2G1CjCqfOYs/wAQHsAhqUdKvWTPihtI3YUYVMv83rJnxQqZf5vWTPihtI3YUYVMv83rJnxQqZf5vWTPihtI3YUYVMv83rJnxQqZf5vWTPihtI3YUYVMv83rJnxQqZf5vWTPihtI3YUYVMv83rJnxQqZf5vWTPihtI3FKAzLRXOLCuZf824cOkxlhErof94qV/5EwdeOSkOSABvNhDaQfETghJUrIX49XEm3bEdB4ZWHBnTWJW705uo1HNrWgWFw5xQCyCJaSVJGVRDsT1dA/wDw0sDMM40TGpAe1r2HvjglOw5nmtDAZbWduDwSbihOGrSCCd5ZrX3PAcXiDJVRLsGe984PicOmUnWI5wbO+ecBGRNGHFK7k32fNvboiCcKUK1xalyphmxy6nv0xPByxPBVMuQWDWtnApeIUpeqPMcpbewdr9kASeOUtRanOq2fQz9ESGKATqGNTUPZnNul27IhjDqG1dqnd75M3tMEGHSUa7x2rfc4D5QA5COT3Xeqwp/5aIzcGqcTMSwCsgc7W3P0Q+DXryRMuE3DWiGIxapSjLQwSnJw+Yc/qYCxisQmcmhGed7ZQ2EmiQCiZmTVa9mA90VNDfajgYnp3nj933mAlKwxQvWqahyeti7W7YnjE8oYy70u72zi1jfsD+6n3RX0BkviPfAS5QmjU+O1HU7NnA8Gnk7mZ42TXyiuf9x/H74t6eyRxPugAzcMZi9alqXB67M9uyC42YMQmiXmDVe1mI94ixgfsBwV7TFDQX2h/dPtTAc9O0GZRUK2JNRADi/XEVaCxKLzFJCeoEnq3x0GmvtOwRpaY+yPEe2A41OhMQu8paSMi4Iv54YaJmk0pWK8mKSzjPfHX6C5h/e9wijg/wDcfxK98NxzytDT0farAfKkE8d8P9BYlqqk0ZuxduD5tHT6fzRwPui2n/b/APx//WA4xOh56/slgkZ1Aj3wjomanZUsBfQElr5b+EdRoHNfAe+AY/7c8U+xMNxz6tB4hF5i0gZbIJv5+MJOgsSu8tSSnrBBfzx12nfsx+8PYqJ6G+z7TAcaNEzV2lrBV0FJA698JWiJyLTVgHMUgm3njodD/ajgfZBNPc9P7vvMBzZ0FiQKlKTRm4Bdt2/hCToWev7JYLZuCODXjssV/t/4U+6K+gcl8R74bjmEaIXzFTGXlYWfiXtGjo/QokKrnkqfK734bouL/wBx/GPbFvT3NTxPsgK68GVq1qAKLHoNmBt2RYxc4TxRLzBqva2Xvg+jvsBwV7TGfoL7Q/un2pgLWFnpkJoXnna+cAw+GVJVrFtSOi+cD039p2D3xo6X+yPZ7RAVMXKM8hUvIBi9r5wWZiEqRqRz2p6nGd+yH0FzFfve4RSwv+4/jV74Czg/+nfWeMzNfLP2wNWGJXrg1D19bC+UT0/4n8Xui1L/ANv/APGfYYCvi1DEACXmm5e0Tw2LTJSJa3qS7sHzL+wwDQPOVwHtitpb7VXZ/wCIgP/Z"},
                               {"label":this.resources.strings.set_checkbox_state,"method":"setCheckboxState","image":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABSElEQVQ4jY3Tv04UURzF8c9uRkIIMcRQGGN4AGsqyw2VsfUBpDPGxlAZKCyUUOALWBASrHwMS2OhrbEBbaAx8i/BwKGYC3t3HeKeZDJn5t7v+f3unbk90scrPMVt9A1V+ytd4De28LbBKl5gDT/LhIsOsF/d7+ENbiF7ZLkD6FCmSVP8MtlrMIfdCeAGn9oO8qQwc43udXZpDYvFP8AJGuSUDP5TfZH8JSEfy7sBOZ2geqaxXart43k9OhaQmQLUel1ahmf09scrlCXkDvlKPrce8pCcl9Y/jHGDlh0GPC4TQ76QBfK9PP8aht4YAHlZhRxX/lHH3lwHHJOlamClAkPe/wuPBhyOBox08oPM3hCwRA4b/NH+25V678g37NI76g5wF0cNdrBOzrSHifYwnWCezFfQ1We/j43CZopskoOyoZNcB4WZugROpLDHUvTMkwAAAABJRU5ErkJggg=="}];
 		
    },
    processBindMethods: function(){
        var insp = this;
		if(this.bindMethods){
			array.forEach(this.bindMethods, function(bindMethod){
				var callout = insp.getCallout(bindMethod);
				aspect.after(callout[0], callout[1], function(arg1) {
					try{
						var wait = bindMethod.wait?bindMethod.wait:10;
						var myInsp = insp;
						window.setTimeout(function(){
                            var bindNode;
                            if(arg1){
                                bindNode = insp.getNodeForBinding(arg1.parentNode?arg1.parentNode:arg1, bindMethod);
                            }
							if(!bindNode || bindMethod.fullDoc){
								bindNode = win.body();
							}
							insp.addInspectionPoints(bindNode);
							
						}, wait);
					}
					catch(error){
						// do nothing, but don't break original functions
					}
				},true);
			});
		}
    },
    addInspectionPoints: function(searchNode){
		var insp = this;
		for(index=0;index<this.interactionElements.length;index++){
			var interactionElement = this.interactionElements[index];
			var domElements = query(interactionElement.query, searchNode);
			domElements.forEach(function(node){
				if(!inspectorDialog.domNode.contains(node)){
					insp.addInspectionPoint(node, interactionElement);
				}
			});  
		}
	},
    isAssertionNode: function(node, attrValue){
		return /<[a-z][\s\S]*>/i.test(attrValue)!==true || node.tagName == "LABEL" || node.tagName == "BUTTON" || node.tagName == "P";
	},
    recordInteraction: function(e){
        var node = this.inherited(arguments);
		if(node && e["recorded"]){
			var newInteraction;
			switch(node.tagName){
				/*case "SELECT":
					newInteraction = lang.clone(inspectorData.interactions[inspectorData.interactions.length-1]);
				    this.deleteInteraction(this.currentInteraction);
					var comment = newInteraction.comment;
					delete newInteraction.comment;
					newInteraction["params"] = [node.value];
					newInteraction["event"] = "select";
					newInteraction["comment"] = comment;
					this.addInteraction(e, newInteraction);
                    this.addInspectionPoints();
 					break;*/
                default:
                    this.addInspectionPoints();
                    break;
            } 
        }
        else
            this.addInspectionPoints();
    },
    startup: function(headlessOption, url){
    	this.inherited(arguments);
    },
	hasKeyboardEvents: function(node){
		return node.tagName === 'INPUT' || node.onkeypress || node.onkeydown || node.onkeyup;
	},
	hasMouseEvents: function(node){
		if(attr.get(node, "disabled")=="true"){
			return false;
		}
		
		if(attr.get(node, "mouseEvents")=="true"){
			return true;
		}

		var listeners = JSON.parse(attr.get(node, 'mx-listeners'));
		if(listeners){
			if(listeners.tap){
				return true;
			}
			
			if(listeners.click){
				return true;
			}

			if(listeners.mouseup){
				return true;
			}
		}
		
		var component = this.getMaximoComponent(node);
		
		switch(node.tagName){
			case "A":
				var href = attr.get(node, "href");
				if(!href){
					return false;
				}
				return href.trim().length>0 && href.indexOf("void(0)")==-1;
			case "LABEL":
				
				if(component.tagName==='MAXIMO-SELECT' || component.tagName==='MAXIMO-LABEL'|| component.tagName==='MAXIMO-TEXT' || component.tagName === 'MAXIMO-RADIOBUTTONGROUP'){
					return true;
				}
				return attr.get(node, "role")==="button";
			case "BUTTON": //always allow mouse events on buttons
				return true;
			case "IRON-ICON": //always allow mouse events on buttons
				return true;
			case "PAPER-ITEM": //always allow mouse events on buttons
				return true;
			case "PAPER-ITEM": //always allow mouse events on buttons
				return true;
			case "DIV": //always allow mouse events on buttons
				return true;
			case "TD": //always allow mouse events on buttons
				return true;
            case "svg":
                return true;
            case "path":
                return true;
			case "INPUT": //always allow mouse events on buttons
				var type = attr.get(node, "type")
				return  type && type.in('button,checkbox,password');
		}
		return node.onclick || node.onmousedown || node.onmouseup || node.onmouseover || node.onmouseenter;
	},
    // Comment Code Below
	getMaximoComponent: function(node){
		do {
			node = node.parentNode
		}
		while(node && node.tagName && node.tagName.indexOf('MAXIMO')===-1);
		if(node && node.tagName && node.tagName.indexOf('MAXIMO')===0){
			return node;
		}
		return null;
	},
    verifyToastDisplayed: function(){
		var messageContainer = dom.byId("UINotificationContainer");
        var message = messageContainer.childNodes.length != 0;
		if(message)
            this.addInteractionNoCheck(null, {"event":"verifyToastDisplayed","params":["true"]});
		else
            this.addInteractionNoCheck(null, {"event":"verifyToastDisplayed","params":["false"]});
	},  
    verifyToastMessage: function(){
		var messageContainer = dom.byId("UINotificationContainer");
		if(messageContainer){
			var message = messageContainer.textContent;
            if(message.length>0){
				this.addInteractionNoCheck(null, {"event":"verifyToastMessage","params":[message]});
			}
		}
	},
    addVariable: function(){
		var insp = this;
		if(insp.validateVariable()){
			var variable = dom.byId("insp_variableName").value;
			insp.varNames.push(variable);
			var id = dom.byId("insp_dataId").value;
			var note = insp.updateParams(insp.resources.strings.variable_created, ["<span class='variable'>"+variable+"</span>", id]) ;
			insp.addInteractionNoCheck(null, {"event":"makeVariable","id":id,"params":[variable],"comment":note});
			insp.showNotification(note, 0);
			dom.byId("insp_variableName").value="";
			dom.byId("insp_dataId").value="";
		}
	},
    getToastMessage: function(){
		var insp = this;
		toastDialog = new insp.InspectorDialog({
	    	id: "insp_DataDialog",
	        title: insp.resources.strings.get_toast_message,
	        content: '<div class="notification" id ="insp_makeVariable_info" style="text-align: center; height: 20px;">&nbsp;</div>'+
			'	<div class="insp_d_content">'+
			'		<label for="insp_variableName"><span style="color:orange">* </span>'+insp.resources.strings.variable_name+'</label><br>'+
	        '		<input type="text" id="insp_variableName" size="20" /><br><br>'+
	        '		<label for="insp_messageId"><span style="color:orange">* </span>'+this.resources.strings.toast_message+'</label><br>'+
	        '		<input type="text" id="insp_messageId" size="50" readonly style="background-color: #e7e7e7; border: 1px solid #999; margin-right: 10px"/>'+
	        '		<button id="insp_addVariableButton" data-method="addVariable" style="vertical-align:middle; margin: 0px 5px; padding: 3px;" height: 22px; width: 22px ><img style="margin: 0px" width="18" height="18" title="" alt="" src="'+insp.resources.images.add+'" /></button>'+
			'		<input type="hidden" id="insp_dataId" size="20" />'+
	        '    </div>'+
			' 	<div class="inspectorToolbar" style="text-align:'+insp.reverseAlign+'">'+
	        '		<button id="insp_titlebarDoneButton" data-method="cancel">'+insp.resources.strings.done+'</button>&nbsp;'+
	        '	</div>',
	        onHide: function(){
	        	toastDialog.destroyRecursive(false);
	        	style.set(registry.byId("insp_inspectorDialog").domNode, {"display":""});
 	        },
	        onShow: function(){
	        	inspectorData.dialogPosition = geom.position(this.domNode);
	        	insp.storeData();
	        },
	        wasRecording: inspectorData.recording,
	        closable: true,
	        autofocus: true,
	        refocus: false
	    });
		insp.processSimpleDialogButtons(toastDialog);
        {
		onEvent(dom.byId("insp_variableName"), "keyup, change", function(e){
				insp.validateVariable();
			});
			onEvent(dom.byId("insp_dataId"), "keyup, change", function(){
				insp.validateVariable();
			});
        }
		style.set(toastDialog.containerNode, {"padding":"0px"});
		toastDialog.show();
		insp.validateVariable();
		insp.centerDialogOnParent(toastDialog, inspectorDialog);
		var underlay = dom.byId("insp_DataDialog_underlay");
		style.set(underlay, {"background":"transparent"});
		var toastdiv = dom.byId("UINotificationContainer");
        toastdiv = toastdiv.firstChild.firstChild.childNodes[1];
 		var message = toastdiv.textContent;
		message = message.replace(/&nbsp;/g, '');
		dom.byId("insp_messageId").value = message;
		dom.byId("insp_dataId").value = "UINotificationContainer";
		dom.byId("insp_variableName").focus();
	},
	hoverOverElement: function() {
		var insp = this;
		hoverDialog = new insp.InspectorDialog({
	    	id: "insp_hoverDialog",
	        title: this.resources.strings.hover,
	        content: ''+
			'<div class="notification" id="insp_makeVariable_info" style="text-align: center;height: 20px;">&nbsp;</div>'+
			'		<label for="insp_dataId"><span style="color:orange">* </span>'+insp.resources.strings.field_id+'</label><br>'+
	        '		<input type="text" id="insp_dataId" size="30" readonly style="background-color: #e7e7e7; border: 1px solid #999; margin-right: 10px"/>'+
	        '</div>'+
			'<div class="inspectorToolbar" style="text-align:'+reverseAlign+'">'+
	        '		<button id="insp_addButton" data-method="addHover">'+insp.resources.strings.add+'</button>&nbsp;'+
	        '		<button id="insp_doneButton" data-method="cancel">'+insp.resources.strings.done+'</button>&nbsp;'+
	        '	</div>',
	        onHide: function(){
	        	hoverDialog.destroyRecursive(false);
	        	hoverDialog.hide(hoverDialog);
	        },
	        onShow: function(){
	    		inspectorData.dialogPosition = geom.position(this.domNode);
	        	insp.storeData();
	        },
	        autofocus: true,
	        refocus: false
	    });
		insp.processSimpleDialogButtons(hoverDialog);
		style.set(hoverDialog.containerNode, {"padding":"0px"});
		hoverDialog.show();
		var underlay = dom.byId("insp_hoverDialog_underlay");
		style.set(underlay, {"background":"transparent"});
		insp.centerDialogOnParent(hoverDialog, inspectorDialog);
		onEvent(underlay, "mousemove", function(e){
			insp.removeHighlights();
			style.set(this, {"display":"none"});
			var node = document.elementFromPoint(e.clientX, e.clientY);
			style.set(this, {"display":""});
			insp.highlightHover = node;
			insp.addHighlight(node, "2px solid blue");
				});
		this.clickHandler = onEvent(underlay, "mousedown", function(e){
    		style.set(this, {"display":"none"});
			var node = document.elementFromPoint(e.clientX, e.clientY);
			style.set(underlay, {"display":""});
    		e.cancelBubble = true;
			e.preventDefault();
			dom.byId("insp_dataId").value = node.id;
    	});
	},
	addHover: function(){
		var insp = this;
		var hoverElement = dom.byId("insp_dataId").value;
		insp.addInteractionNoCheck(null, {"event":"mouseover","id":hoverElement,"comment":"Hover over "+hoverElement});
	},
    typeIntoRichTextEditor: function() {
		var insp = this;
		rteDialog = new insp.InspectorDialog({
	    	id: "insp_rteDialog",
	        title: this.resources.strings.rte,
	        content: ''+
			'<div class="notification" id="insp_makeVariable_info" style="text-align: center;height: 20px;">&nbsp;</div>'+
            '<div class="rteDialog_content" style="width:550px;height:180px'+
			'		<label for="insp_dataId"><span style="color:orange">* </span>'+insp.resources.strings.field_id+'</label><br>'+
	        '		<input type="text" id="insp_dataId" size="30" readonly style="background-color: #e7e7e7; border: 1px solid #999; margin-right: 10px"/><br><br>'+
            '       <label for="insp_rteText"><span style="color:orange">* </span>Rich Text Editor Text</label><br>'+
            '       <input type="text" id = "insp_rteText" size="90" style="background-color: #e7e7e7; border: 1px solid #999; margin-right: 10px"'+
	        '</div>'+
			'<div class="inspectorToolbar" style="text-align:'+reverseAlign+'">'+
	        '		<button id="insp_addButton" data-method="addRTEText">'+insp.resources.strings.add+'</button>&nbsp;'+
	        '		<button id="insp_doneButton" data-method="cancel">'+insp.resources.strings.done+'</button>&nbsp;'+
	        '</div>',
		
        ohHide:function(){
            var dialog=registry.byId("insp_rteDialog");
            var inspDialog=registry.byId("insp_inspectorDialog");
            style.set(inspDialog.domNode, {"display:":"","left":inspectorData.dialogPosition.x+"px", "top":inspectorData.dialogPosition.y+"px"});
            insp.removeHighlights();
            dialog.destroyRecursive(false);
            Dialog._DialogLevelManager.hide(rteDialog);
            inspectorData.recording=rec;
            this.clickHandler.remove();
        },
        onMouseUp: function(){
            inspectorData.dialogPosition = geom.position(this.domNode);
            insp.storeData();
        },
        wasRecording: inspectorData.recording,
        closable: true,
        autofocus: true,
        refocus: false
    });
    insp.processSimpleDialogButtons(rteDialog);
    style.set(rteDialog.containerNode, {"padding":"0px"});
    rteDialog.show();
    var underlay = dom.byId("insp_rteDialog_underlay");
    style.set(underlay, {"background":"transparent"});
    insp.centerDialogOnParent(rteDialog, inspectorDialog);
    onEvent(underlay, "mousemove", function(e){
        insp.removeHighlights();
        style.set(this, {"display":"none"});
        var node = document.elementFromPoint(e.clientX, e.clientY);
        style.set(this, {"display":""});
        insp.highlightHover = node;
        insp.addHighlight(node, "2px solid blue");
    });
    this.clickHandler = onEvent(underlay, "mousedown", function(e){
        style.set(this, {"display":"none"});
        var node = document.elementFromPoint(e.clientX, e.clientY);
        style.set(underlay, {"display":""});
        e.cancelBubble = true;
        e.preventDefault();
        dom.byId("insp_dataId").value = node.id;
    });
	},
    addRTEText: function(){
		var insp = this;
		var rteElement = dom.byId("insp_dataId").value;
        var rteText = dom.byId("insp_rteText").value;
		insp.addInteractionNoCheck(null, {"event":"typeover","id":rteElement,"params":[rteText],"comment":"Type "+rteText+" in the rich text editor"});
        dom.byId("insp_dataId").value="";
        dom.byId("insp_rteText").value="";
	},
    setCheckboxState: function(){
		var insp = this;
		checkboxDialog = new insp.InspectorDialog({
	    	id: "insp_DataDialog",
	        title: insp.resources.strings.set_checkbox_state,
	        content: ''+
			'<div class="notification" id="insp_makeVariable_info" style="text-align: center;height: 20px;">&nbsp;</div>'+
			'<div id="insp_checkbox" style="padding:10px">'+
	        '				<label for="insp_dataId"><span style="color:orange">* </span>'+insp.resources.strings.field_id+'</label><br>'+
	        '				<input type="text" id="insp_dataId" size="30" readonly style="background-color: #e7e7e7; border: 1px solid #999; margin-right: 10px"/>'+
	        '</div>'+
			'<div class="insp_d_content">'+
			'	<label for="insp_checkboxstate"><span style="color:orange">* </span>'+this.resources.strings.checkbox_state+'</label><br>'+
			'		<input type="radio" id="rb_checked" name="checked" value="ckd" checked>'+this.resources.strings.checked+'</input>&nbsp;'+
			'		<input type="radio" id="rb_unchecked" name = "checked" value="unckd">'+this.resources.strings.unchecked+'</input><br><br>'+
			'<label for="insp_checkboxComment">'+insp.resources.strings.comment+'</label><br>'+
	        '<input type="text" id="insp_checkboxComment" style="width: 300px" />'+
			'</div>'+
			'<div class="inspectorToolbar" style="text-align:'+reverseAlign+'">'+
	        '		<button id="insp_addCheckedButton" data-method="addCheckboxState">'+insp.resources.strings.add+'</button>&nbsp;'+
	        '		<button id="insp_doneCheckedButton" data-method="cancel">'+insp.resources.strings.done+'</button>&nbsp;'+
	        '	</div>',
	        onHide: function(){
	        	checkboxDialog.destroyRecursive(false);
	        	Dialog._DialogLevelManager.hide(checkboxDialog);
	        },
	        onShow: function(){
                inspectorData.dialogPosition = geom.position(this.domNode);
	        	insp.storeData();
	        },
	        autofocus: true,
	        refocus: false
	    });
		insp.processSimpleDialogButtons(checkboxDialog);
		style.set(checkboxDialog.containerNode, {"padding":"0px"});
		checkboxDialog.show();
		var underlay = dom.byId("insp_DataDialog_underlay");
		style.set(underlay, {"background":"transparent"});
		insp.centerDialogOnParent(checkboxDialog, inspectorDialog);
		onEvent(underlay, "mousemove", function(e){
			insp.removeHighlights();
			style.set(this, {"display":"none"});
			var node = document.elementFromPoint(e.clientX, e.clientY);
			style.set(this, {"display":""});
			if(node != insp.assertHighlight && node.tagName=="IMG"){
						insp.highlightHover = node;
						insp.addHighlight(node, "2px solid blue");
					}
				});
		this.clickHandler = onEvent(underlay, "mousedown", function(e){
    		style.set(this, {"display":"none"});
			var node = document.elementFromPoint(e.clientX, e.clientY);
			style.set(underlay, {"display":""});
    		e.cancelBubble = true;
			e.preventDefault();
			if(node.tagName.toLowerCase() ==="svg" || node.tagName.toLowerCase() === "label") {
                var newNode = node.previousElementSibling;
                if (newNode.className === "mx--datalist-checkbox" || newNode.className === "bx--checkbox")
				    dom.byId("insp_dataId").value = newNode.id;
			}
    	});
	},
	setCheckboxElement: function(node){
		if(!node.id){
			insp.missingId(null, node);
			insp.showNotification(insp.resources.strings.missing_id, 1);
			return;
		}
		if(insp.assertHighlight){
			insp.removeHighlights();
			onEvent.emit(insp.assertHighlight, "mouseout", {
				cancelable: false,
				bubbles: true
			});
			insp.assertHighlight = null;
		}
		insp.addHighlight(node, "2px solid red");
		insp.assertHighlight = node;
	},
	addCheckboxState: function(){
			var insp = this;
			var id = dom.byId("insp_dataId").value;
			var state = null;
			var rbChecked = dom.byId("rb_checked").checked;
			if (rbChecked)
				state = "true";
			var rbUnchecked = dom.byId("rb_unchecked").checked;
			if (rbUnchecked)
				state = "false";
			var commentValue = "";
			var comment = dom.byId("insp_checkboxComment");
			if(comment){
				commentValue = comment.value;
			}
			if(commentValue.trim().length === 0){
				commentValue = "Set checkbox state to "+state; 
			}
			var note = insp.updateParams(this.resources.strings.checkbox_state_added, [id]) ;
			insp.showNotification(note, 0);
			insp.centerDialogOnParent(checkboxDialog, inspectorDialog);
			insp.addInteractionNoCheck(null, {"event":"selectCheckbox","id":id,"params":[state],"comment":commentValue});
			dom.byId("insp_dataId").value="";
			dom.byId("insp_checkboxComment").value="";
			var message = this.resources.strings.checkbox_added_success;
			insp.showNotification(message+" "+(parseInt(insp.currentInteraction)+1),0);
	},
    getComment: function(type, e, node){
		if(!e && !node){
			return "";
		}
    	if(!e && !node){
			return "";
			}
    	node = node?node:e.target;
        if(e){    
            switch(e.type){
            case 'click':
                var myText = ''
                if (node.tagName.toLowerCase() == "li")
                    identifier = "Click the " + node.innerText + " list item";
                else if (node.id === "" && node.className === "" && node.nodeName === "DIV" && node.parentNode.parentNode.nodeName === "BUTTON"){
                    var parentNode = node.parentNode.parentNode;
                    identifier = "Click the " + node.innerText + " button";
                }
                else 
                    identifier = "Click the "+node.innerText+' '+node.tagName.toLowerCase();
                break;
            case 'change':
                if (node.tagName == 'INPUT' && node.className.indexOf("bx--text-input") > -1){
                    var label = node.parentNode.previousSibling.textContent;
                    identifier = "Type " + node.value + " in the " +label + " input field";
                }
                else if (node.tagName == 'INPUT' && node.className == "bx--search-input")
                    identifier = "Type " + node.value + " in the search field";
                else if (node.tagName == 'INPUT' && node.className == 'mce-textbox')
                    identifier = "Type " + node.value + " in the " +node.parentNode.previousSibling.textContent + " field";
                else {
                    //if(node.tagName=='INPUT'){
                    var label = "";
                    if(node.labels.length>0){
                        label = node.labels[0].innerHTML;
                    }
                    identifier=e.type+' '+label+' to '+node.value;
                }
                break;
			case 'mouseup':
				if (node.id=='backicon' || (node.id.indexOf("goBack_icon") > -1))
					identifier="Click the back arrow";
				else if (node.id.indexOf('navigationmenu_wc_') > -1)
					identifier = "Click the "+node.innerText+ " list item";
				else if (node.id.indexOf('collapseIcon') > -1){
					var parentNode = node.parentNode;
					identifier = "Click the collapse icon for the "+ parentNode.innerText +" section";
				}
				else if (node.id.indexOf('wc_')> -1){
					if (node.nodeName == 'A' && (attr.get(node, "role")==='button'))
						identifier = "Click the "+ node.title + " button";
				}
				else if (node.id.indexOf('_link') > -1){
					if (node.nodeName == 'A')
						identifier = "Click the "+ node.innerText + " link";
				}
				else if (node.nodeName == 'IRON-ICON'){
					if (node.id == 'notficon')
						identifier = "Click the notifications icon";
					else if (node.id == 'menuicon')
						identifier = "Click the menu icon";
					else if (node.id == 'navigationmenu_button')
						identifier = "Click the Go To icon";
					else if (node.id == "wrkspaceimg_icon")
						identifier = "Click the User icon";
					else if (node.id.indexOf('labelIcon_') > -1){
						var iconName = node.id.split("_");
						identifier = "Click the "+iconName[1] + " icon";
					}
					else if (node.id.indexOf('_searchbar_searchicon') > -1)
						identifier = "Click the icon in the Search bar";
					else if (node.id.indexOf('sendMessage') > -1)
						identifier = "Click the send message icon";
					else if (node.id.indexOf('record_showInfo_icon') > -1)
						identifier = "Click the show information icon";
					else						
						identifier = "Click the icon";
				}
				else if (node.tagName == 'LI' && node.id === ""){
					node = node.childNodes[0];
					identifier = "Click the "+node.innerText+ " list item";
				}
				else if (node.tagName == 'LI' && node.id !== "")
					identifier = "Click the "+node.innerText+ " list item";
				else if (node.id.indexOf('inputComment') > -1)
					identifier = "Click the comment field";
				else if (node.id.indexOf('tool_inspectorsup') > -1)
					identifier = "Click the Set as home icon";
				else if (node.id.indexOf('_home_button_') > -1)
					identifier = "Click the " +node.title+ " button";
				else if (node.tagName == 'INPUT' && node.id.indexOf('_input') > -1){
					var parentID = node.id.replace('_input','_label');
					var parentNode = dom.byId(parentID);
					if (parentNode !== null)
						var fieldLabel = parentNode.innerText;
					else
						var fieldLabel = "";
					identifier = "Click the "+fieldLabel+ " input field";
				}
				else
					identifier = "Click the " + node.innerText + " list item";
				break;
			case 'keydown':
				var key = this.getKey(node, e.keyCode, ((e.ctrlKey)?"CTRL":"")+((e.altKey)?"ALT":"")+((e.shiftKey)?"SHIFT":""));
				if (node.id.indexOf('searchbar') > -1 || node.id.indexOf("_search") > -1)
					identifier = "Press the "+key+" key in the Search bar";
				else
					identifier = "Press the " +key+ " key in the field";
				break;
            default:
                identifier=e.type+' '+node.value;
                break;
            }
        }
        else{
            identifier='Assert '+node.innerText;
        }

    	/*var component = this.getMaximoComponent(node);
    	identifier = component.tagName +"[" + component.id + "] ";
    	switch(node.tagName){
    		case 'INPUT':
    			switch (attr.get(node, "type")){
    				case 'button':
    					identifier += attr.get(node, "value");
    					break
    				case 'checkbox':
    					identifier += $j(node.nextElementSibling.firstElementChild).text();
    					break
    				case 'radio':
    					break
    				case 'search':
    					identifier += "unsure of how to tell which search in comments";
    					break
    				default:
    					identifier += $j(node.previousElementSibling).text();
    					break
    			}
    			
    			if(attr.get(node, "type")==='button'){
    				
    			}
    			if(attr.get(node, "type")==='checkbox'){
    				
    			}
    			
    			break;
            case 'IRON-ICON':
                if(node.icon=="close"){
                    identifier += attr.get(node, "icon")
                }
                break;
            case 'DIV':
                identifier += attr.get(node, "icon")
                identifier += node.innerText.trim()+$j(node.nextElementSibling);
                break;
    		case 'LABEL':
    			if(attr.get(node, "role")==='button'){
    				identifier += " : "+ $j(node).text();
    			}
    			break;
    	}   */
    	return identifier;
    }
  });
});

String.prototype.in = function(str) {
	var array = str.split(',');
    return array.includes(this.toLowerCase());
};