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
/*jshint -W069 *
/*jshint scripturl:true */
/*jshint maxlen:false */
/*jshint loopfunc:true */
define(["dojo/_base/declare",
        "dojo/query",
        "dojo/_base/lang",
        "dojo/dom-attr",
        "dojo/dom-style",
        "dojo/_base/array",
        "dojo/on",
        "dojo/_base/event",
        "dijit/registry",
        "dijit/popup",
        "dojo/dom",
        "dijit/Dialog",
        "dojo/_base/window",
        "dojo/dom-geometry",
        "dojo/aspect",
        "dojo/dnd/move",
        "dojo/topic",
        "dojox/gesture/tap",
        "dojo/touch",
        "dojox/layout/ResizeHandle", //ensures required is loaded
        "dojo/dom-class"], function(declare, query, lang, attr, style, array, onEvent, event,
        		registry, popup, dom, Dialog, win, geom, aspect, move, topic, tap, touch, ResizeHandle, domClass){
  return declare(null, {
  	resources: { "strings":{"yes":"Yes","no":"No","remove":"Remove","removed":"Removed {event} from position","record_pause":"Record / Pause", 
	  			"assert_label":"Attributes - click on the rows below to add them to the assertion", "assertion":"Assertion", "comment":"Comment",
				"assert":"Assert", "assertion_add_success":"Assertion added to position", "assertion_add_fail":"Assertion could not be added. Ex. prop == &quot;value&quot;", 
				"ok":"Ok", "cancel":"Cancel","clear":"Clear", "add":"Add", "options_title":"Recorder Options", "done":"Done", "download":"Download", 
				"view_output":"View Ouput", "product_name":"IBM Interaction Recorder","add_comment":"Add Comment", "run":"Run", "missing_id":"Missing Id", 
				"cannot_record":"Cannot record interaction", "bubbled_from":"Bubbled from", "sleep":"Sleep", "add_sleep":"Add Sleep - seconds", "screen_shot":"Screen Shot",
				"middle_insert":"Added {event} to position", "clear_all":"All interactions were removed", "edit":"Edit Interaction", "apply":"Apply","importer":"Import","exporter":"Export","confirm_overwrite":"Importing will overwrite existing interactions, Are you sure?",
				"confirm_clear":"Are you sure you wish to clear all interactions and test configuration?<br><small><i style='color:red'>This cannot be undone.</i></small>",
				"invalid_interactions":"Import failed. Check interactions syntax.","import_help":"Paste interactions below and click 'Import'.",
				"choose_attribute":"Choose {0} sub attribute","undo":"Undo","import_info":"<b>Did you know?</b><br> You can import files by clicking the File Input or dragging them from your computer onto it. Even easier, skip this dialog entirely by dragging them onto the main Interaction list.",
				"assertion_builder_help":"<ul style='padding: 5px 20px; border: 0px !important;'><li>Choose element for which you wish to assert some attribute(s)</li><li>Choose comparison  for desired attribute from list</li><li>Modify Assertion as desired</li><li>Click the + button to add</li></ul>",
				"get_data":"Create Variables","variable_name":"Variable Name","field_id":"Field id","button_id":"Button id","variable_created":"Variable {0} was created from node '{1}'","random_created":"Random {0} was created from with type [{1}] length [{2}]'","random_minmaxcreated":"Random {0} was created from with type range: min {1}, max {2}'",
			    "random":"Random","runtime":"Runtime","random_type":"Type","random_length":"Length","random_min":"Min Value","random_max":"Max Value","sql":"SQL","sql_stmt":"SQL Statement","assert_sql_true":"Assert True","assert_sql_false":"Assert False","interaction":"interaction","date":"Date","dateType":"Type","date_days":"Days","date_months":"Months","date_years":"Years","date_hours":"Hours","date_minutes":"Minutes","original_date":"Initial Date/Time","date_format":"Format","date_format_type":"Date Format","date_format_timezone":"Time Zone Designator"
			},
			"images": {
				"add":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAALHRFWHRDcmVhdGlvbiBUaW1lAFNhdCAyMiBOb3YgMjAxNCAwNzowODoxNCAtMDUwMEO70VwAAAAHdElNRQfeCxYMCCwVWfEiAAAACXBIWXMAAAsSAAALEgHS3X78AAAABGdBTUEAALGPC/xhBQAAAQ1JREFUeNpjFKvayEANwEQVU4CABZ+k3c9X/x984gSzFfi+MxxiF2MkyyCQIY3pjgz/geyGmfsZGETp4DX6GvSfCDXwMEIOWAxDoCbJvf6MYiZyBDDC0hFIUU+eC8Pvf/8ZYFHDxMTE8PXHH4b/QO2cbEwMf4ByIDYIg9TUzdzH8EiUlxHFRSDw5edfhoevv4EV/gNqAiKGv0Di7z8GoCFA9t//YMP+AdlKEqiuZ0F2JjiK0UBBjB3D2bsfGA4fv4QhB9LziIEX1SCwX9HSCci7yCkQ5g04H2oIUbEmwM0K9iIhQDj6oYFLsUFyohwMNhqCBA3Cm9dAgZnYuhXORg4TkgxCjgB8hhAXRkQCAEYYa9edJ7XiAAAAAElFTkSuQmCC",
		        "assert":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAALHRFWHRDcmVhdGlvbiBUaW1lAFNhdCAyMiBOb3YgMjAxNCAwNjo1NTo1MCAtMDUwMGqBBcIAAAAHdElNRQfeCxYLOAT65XmuAAAACXBIWXMAAAHXAAAB1wGMkghoAAAABGdBTUEAALGPC/xhBQAAAkFJREFUeNqdk71rWlEYxp/jVzAqkkEMIRhQMuikIAQDiRBIpkL+g7oIuoiba+niXnBwEwtOulkQkRgUNWQIIuIYAhlCqmIQk/gVPfU91EuL17bps5xzLu/93ee873MZ5xx/U6vV4tfX12i32+JstVrh9XphNpvZsob9CTSbzXB5ecnr9Tomkwm0Wi3m8znG4zEMBgM8Hg/cbjdbaD1oOp0iHo/zXq8Hu92Os7MzbGxsgOo7nQ6y2Sy63S5cLhfOz8/ZWlChUOCVSgUnJyc4OjqCQqFYcZvL5VCtVhEIBKCQgwyHQ5TLZdhsNhwfH0uQ508fpBqlUim5vLi4kAfd3d3x0WiEw8ND0P1/1e3trbTXaDTC8cPDA1RyoJeXFxDIYrGsODF/DeN5seo/fxNnk8mE19dXeRDZputQM3d2dqSXCPj94xex1/+sJQhJ9mr0FRpzs9mUHQT1jkSDKhaL0Ov18qDd3V22t7cnigaDgfScnC0hJPoQ9UwMBGt0enoqRhyNRtFoNITDpd7e3nB1dYVYLIatrS0cHBys5ojOqVSKPz09YX9/n/KEfr8Pcrh4QfSNwLRub28jEokwo9H4e7Jpn0wmea1WEw33+XxwOp0sn8/zUqmEx8dHqFQqkXT6PRbxYBQBkgSiNZFIcEoqFTscDgSDQUaBI9HVaEKUK51Ot9IKAVpCKM1qtVpAQqEQI+C/SkV/dTqdFtaXtt8LEdmjW93c3IieECQcDjNy9V6x+/t7nslksLm5Cb/fzwj4P/oBdWIVMCei9m0AAAAASUVORK5CYII=",
				"clear":"data:image/gif;base64,R0lGODlhEgASAOZPAODNLlhjkYmRs8ieQb5sSIZJL+C2o3tJOf7+/vj/9vbuhNGHi3JWJqCWdaGXd8zAgJuHgqm3qfr4+FhOV8y+c0VLTXN2a62yWK6en//2iKqTkOvl5cDQoff19aadnZ2jl6HBs3tpYq2pjq+4r451VIiMiP/ylP39/WZEMLWfnv7+/b6jm5Gal6emnrOChP//i5yUee/o6cHozLeul8O4bbm9vXpYXn1QQdLDf//6i1M/PMGtp5+Oi4apspCGO6+vdpRpXXpHOLGhlOzAwYqKb6FhXtTGgICnrc/Wy6mcfqeafdTDgsGwqquorMSnGP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAE8ALAAAAAASABIAAAeOgE+Cg4SFhoeEDg+IhipKSwqMhUk4JgCSgw0UCgCXkggwRhmdTpgiNC+dAwOMCBY/OaoDDIwjERwXPqsMM4gtHwkyIEQkKEKHHRAhTEgJRzU6PIcSKQVDLhosPRUeiBsFBgYLBDYTJYwx4ONFB02IAgJPQAUEBAcY8PmEAQFPJys3gux4wq9gP0wIEz4JBAA7",
	        	"clear_field":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAAB3RJTUUH3wIQDxQMKSHc5gAAAAlwSFlzAAALEwAACxMBAJqcGAAAAARnQU1BAACxjwv8YQUAAAAGUExURQAAAGNjY3WdxDAAAAABdFJOUwBA5thmAAAAMElEQVR42mNgoAQwYjIYGdEYcCaSCJSDIgLmoolAxBgICWFqxDQe0xFYnYrBIAsAAClqAD0fvACtAAAAAElFTkSuQmCC",
	        	"clear_field_hover":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAAB3RJTUUH3wIQDyEYkcrKLQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAARnQU1BAACxjwv8YQUAAAAPUExURQAAAISUrQAAAMbGxs4AAHBUWucAAAABdFJOUwBA5thmAAAAW0lEQVR42m2QURIAMQRDpdz/zFvCoLP5aHnTaIbIn86WE106CGTVWyGzZF7UK7K4ErG5Bxp5S9JIizxIF6JxIneBrEPcORghajJmVDA9btE/JqPxWQ5iYZgS+QD9hgL9aA+kZAAAAABJRU5ErkJggg==",
		        "comment":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAALHRFWHRDcmVhdGlvbiBUaW1lAFNhdCAyMiBOb3YgMjAxNCAwNjozOTo0NSAtMDUwMAaaADYAAAAHdElNRQfeCxYLKA5Q8oLhAAAACXBIWXMAAAsTAAALEwEAmpwYAAAABGdBTUEAALGPC/xhBQAAAdhJREFUeNqFU88rRFEUPnc8jGEUGt6UQkT5PQtCTONHFpKiyEIJC2VhZ8NCFv4BC1JkwcJKWEjSNA0rGws2ZGpIZiSFMWMwjDlH93XfzK356vXueZ3ve9/5cVn+7B4gFuyl0cvrW3h6fgeO+8cnkKGwwALtzVUw7/YwjBVRoNVhB2OaAmkZqVLy18e3dj4+chIPhdjK4SUJdHV3QLZJgXCUgZFFtWSMZSLhrwicutxQXV4EBu4ABRDJBJCMD8LWUA/IV7AHWIIMKCgKcQTC/yLmzGzqoQGSQHQmwvAT0s5kgZeyur5DE5mb6qN4cXmfJjE5MQB3Xg9s7rrAVlkCdU0tOkFdHXykvmCK7ttbKALPgU+Kyb7gQhPBJHQzPtpPH/NycunNY2ykWqhCT2cz5JnTE0rTOeFkTsyMNQ6biA82D4VkUDhBJIsTiLfO8ZtigmDw7T+ntroMPFfXui3lAjxZBrNRAf+9H5DPvP7X6NbJDdWqFpcmJIsuRbw83FKzR9piIngBz6YdJOTz+aUE3GgOXHWE1aqSQOOSizF+izeGbdKtOnBdEAGd4p9tFRawZOVA75pTW2VtOmPb50wmMqgqJI53ZGaolf4cn5N07dEFltnjqJEKIP4A/qDVhN5x7EYAAAAASUVORK5CYII=",
		        "edit":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAB3RJTUUH3gsaEhYWW3omjQAAAAlwSFlzAAALEgAACxIB0t1+/AAAAARnQU1BAACxjwv8YQUAAAG9SURBVHjajVOhltswEJzcM1gzicVQ0MdcaJiwHGtZDvYT2k8oLC08eLBlNbtAH2tYAwVtJjEvS8dKmouTu9fue7ZXetrZmVl51ra/92IE56EKDHxFv0XlP0FRYxcszGKN5d1ydn42MywuSzcFOIKE7gvcomeyg9sabNoGl3GjuI7EJ/YohAWeebNDt3kGXHkNgDdCugcCRaDjIgBbKbGNOX4+tft/A0QWhofTsh9VVPcYmHvv/4NBaCDKgxFJgp9XcHdrFBdmvwmg/itgmQwUEQTD7QcUrni11zVAv4HkbMvCZIF1sKs1/VBYa+htl449tb/2rwP4b4cxqIEGFhTvYZxDfpgNwhBScQwdv+0++6sqjdM/Q2TsQP4i6FQwv//IqshBKAZ+VU+nKW9ANm0/+kytktOHDr2t2Zf5kbbi/NbI2GMKMKKLrJhEtLvvwGKVQEdYO5mAwJDksq5n2csWFXSKptlgbnMWf4YtS4K+dLW5gSG7Zf3u9D/cTBkoL0qPvOLMqzpREvIc518URepSuOl/M5FQ1ov0wJjkk3JsI4AeGQquL1K249V8fPwBenUmRg9+XkSMAVV9O9n7A1CSslxtp/LjAAAAAElFTkSuQmCC",
		        "exporter":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAB3RJTUUH3gwBFCEXjc/GEwAAAAlwSFlzAAALEgAACxIB0t1+/AAAAARnQU1BAACxjwv8YQUAAAEtSURBVHjaY2AYbIARm+CcZef+//iD4HOwQBlAseRYQ4RmIMBr+hSgQdgAyII5SHLIepiwmvQHhw1Q8bnLz2NIMTGQAH4gsYOT1uFXPOf22v9Tbi/9P+f+2v/4QFDiWhSvsaAbdP/LfYYP799DOApBRLsWw6C59/cxcALp70Dc8uYHAwcPB3kGwQAnOEyABkEDGCU5YFEPD+ytt4/919zk9Z8Tyge5yOt4NMO+F+cZfnxhgMTYjx9g/OPHD9wGOSkYMiRLOoEN+A4ViwbyvVQsga6BaAa5CozxeY2TlZPx2vN7//d9vs9w/cN9BksOSQYvaGB//4Gk+g/2AEER0pJUYrz2+tr/ksO9DCW62QyaAooM1++8QCRQdBpfYGuJajFmr2v5byhjSDjRjQwAAImcrMGImarPAAAAAElFTkSuQmCC",
		        "help":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAB3RJTUUH3wIIDDsOQthEjgAAAAlwSFlzAAAB2AAAAdgB+lymcgAAAARnQU1BAACxjwv8YQUAAAJWSURBVHjabZM/aFNRFMaPyR2uUAjooggOJVDIZCkEXihUHEpFsItSsFiUjq1Dxc3B0SJFB4ubKIhByNRBKDgFSh9ICmJBELK0k2uhw6Wk4O/+y708zZDD+e455/vOn3dh7fW+aCUiIxGD1d4uYJewbWwr4L+w37Fd7DcbJ+BbTwqxP6WVFjMyoZhuijKfKdrmhWQTihOjTMsX1Y/AS/AV4ocSfjUhWLyiOa3MwFDEFjXjIpbOOMXifIcX4APi58aFjGOWKR53YGiEoqI97oqBRzIxCW+A7zx7WzZdIe0VfSCoYZljMop2wW+CXwW/DN4B7+rUgW2XYtKLiu7gFBKYQzvbKLpNm33anDUjfYv3H8QtM7tN4xTH2cmN9TflglX04D+zeBEW8I6kHrPoYV/6hZjNTJHLg/ShgmE2DhxmQIY5kuc8noGvBqXnkPTDjC5VtmmLtxXMV+IdZYqeStraMcHL2D38OkVeVTsg/1rN35GIZNvR2Xbw78NsizTx9+ngXjwF34G4fAXzH/6v54pMuhfakwPavYgdENeIx+sHHhXpY7u1PV1R5Is6RXWSWjDf1a6Iv6+4tbhlih/YrXXNvzNyl42tk/QT5i8xOVc03prIpxrMX0kuJd1FXKmEO5qEeZL3vlQUhfhya6PYrQWGxzyeVBWBT4Db1Z+DT0hFEfgJ+Ir/RGDA+U3QIsynaZAOnwE/Aj8Cn8lwS3YKvri9UQz9J5K+nT4M0wSXOs1oPLt8RuAl+LQ70vj15z2znSG2gz8P/hF7qNO9HOK/B5/HdvCHFo+/v89YfpjQgW5MAAAAAElFTkSuQmCC",
		        "importer":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAB3RJTUUH3gwBFCIOwok9EAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAARnQU1BAACxjwv8YQUAAAE1SURBVHjaY2AYbIARm+CcZef+//iD4HOwQBlAseRYQ4RmIMBr+hSgQdgAyII5SHLIepiwmvQHhw1Q8bnLz2NIMTGQAH4gsYOT1uFXDHLy89ff/xMCQYlrcXsN5u+Ww72kOBTToB9/fjBcf3Od4T4Qnn9yHhwmP35gxzgNArnm/pvnDCWXpzJcZ3jO0AOiP9wHGvYDjH/8QGBsJjEhu2bbk3UM54CavwP5+348Z9j2YB1Y/McXaIxBDfmByyCQa/Y9OM8w9/k+Bk4gnxMquRTIPwb06g+Yi0Be/YMaezAATrPIKVRindd/mGHbLJeCXfL9C5LqPzBdWAzCBkDe4wDC518+IBIoOo3PoGRFJ4YP79+D2QIiHAzJZceIin4MgxR5FBl+8EgCMyoHmL9ufjAjUSYNOgAAJtLfqO4VPsEAAAAASUVORK5CYII=",
		        "move":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAB3RJTUUH3gwJEw0RnWY24gAAAAlwSFlzAAALEgAACxIB0t1+/AAAAARnQU1BAACxjwv8YQUAAADASURBVHjaxVPRDUQREESuAT1pQU+0Qgm0oARKoIQ9K08iuXvLy33cJJsV1mSGXQ4AjEKMcRQopThZiER3EUKAWivknME5B1QtSYIZiU7IxDeVKaVhx3sPUkp+rVkpZew9trYqMMaQ1gQj0NWM3Fqjf6RD7AouQr6reVGHXQmz1sJcU+C7PjrFkbUTkNawDaYlzFrr27ciFeFlHA0M7KGfrf3/+9e3WRVhK+B+7/JP4idDS43JdtZOSLZEk2xHgvEGqgiTq/WHVX4AAAAASUVORK5CYII=",
		        "screenshot":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAALHRFWHRDcmVhdGlvbiBUaW1lAFNhdCAyMiBOb3YgMjAxNCAwNjoxOTo0MCAtMDUwMAzOllAAAAAHdElNRQfeCxYLMBrIM87FAAAACXBIWXMAAAsSAAALEgHS3X78AAAABGdBTUEAALGPC/xhBQAAAg5JREFUeNrNVL+LGkEU/mZVdCEKBtEgpkkRi5DmciSClU0gQUE4sJM0FvkLLPQ/EFvBNv+BVdoUSQoJiHhFRETJHVylgeAacX/MZN/bW8890gQs8h7D7sy+9833vjezolar4RSmnQTFtfD9hVarpVarFb8nEgl0u13xT0Dtdlstl0t0Oh1Mp1MIIZBOp9FsNlU8Hsdms+E4pRSklDwYIBxGv98XgjQql8tqvV5jOBzi2Zu6Gw1cfvwATdMQiUQ42XEcTqQNaC0ajfLcMAzk83mP0Xg8RqlUgpF8yiBkuVwOxWIR3w39sLtyPRyOwLYtnKW8uJGrwq/LT57YtEMmk+HdKJgYpM5eY+kkPRBSSXhs1C0oleqXG9CIkv1BZpomzL3pAbh+ntYQi8Xw5eo3NKFhtnvgZ96130++D+Zr8v7tSywWC9aw+FjHI+sGoVDowPTAiOgzALk8AtEE3pWeo9frYTAYcDLpWa/XcbOSgVgG2u/3rL6UQTaa67ZtYzKZgI6AH0stB2xIJbnsQGkMcFQaDQKZzWaoVqvIZrNIpVIoFAqH1h/LwIwsywro5NUFpk7tfeF2tNFoYLfbMbPPP7awLTvAnoHo4I1GI8iH+buPt4+tscU3qcOcf2UmkSevuKMUR2UpHDGqVCqYz+dQ6+lf75Hz04Gu697keoSkqxF1078i5xcXEP/db+RkQH8ANZYXV9hrRbsAAAAASUVORK5CYII=",
	        	"sleep":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAQAAAD8x0bcAAAALHRFWHRDcmVhdGlvbiBUaW1lAFNhdCAyMiBOb3YgMjAxNCAwNjoxMDowNyAtMDUwMLE2je4AAAAHdElNRQfeCxYLNhPntdHnAAAACXBIWXMAAAsRAAALEQF/ZF+RAAAABGdBTUEAALGPC/xhBQAAALxJREFUeNqFkmEZhCAMhjcSzAYXwShGIIJN7iIYgShGsIFrwE0GjBN57tsfgXefbAMjqBi2yGAi8Ej5GxUKcYdeMyxYoS0edZuSa0l5iV+CissiiGmHUN1cyVozMkno4ZphBnyn65rLdYn440bgOOc9ac51uzFiJ057MhKNIZSYmnWCji63iA1qu31KbVecYCeO4I61DVVv59N0AnCHcO65R3HSMj83t112yjQfBkxSSDfg9Lv/T0VvMH50X9JRQsaMWcT/AAAAAElFTkSuQmCC",
	        	"makevar":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAB3RJTUUH3wIREwEmaK/OVQAAAAlwSFlzAAAewgAAHsIBbtB1PgAAAARnQU1BAACxjwv8YQUAAADeSURBVHjaY2AYUcAciIVJUO8OIpjQBNWB2AGI35JgkAcQsyMLgDiHgZifRB8sB2J5ZBeVAPEaIP6IJHYaiC9D2fZA/B+IJ6MZZIHMAbniPhBzoynyB+LrQBwMxKuhfGQ18kD8GYiZYQL5QNyPw+n1QPwaPRygIB7qNTjYzwCJLWQAio1kqJfqoS4SR1OzHupaeCC/RnYe1CZQeBhD+fOh/GI0bz1HdilIYDuxUYQE+pENBsWaAhCfIdEQaSA2AOIJyAa9AOI3JBpUAMQJQPwXXcKfBEO0gdiajKAYqgAA52IjUCpVk9MAAAAASUVORK5CYII=",
	        	"undo":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAB3RJTUUH3gwJEyY2Thx+4AAAAAlwSFlzAAALEgAACxIB0t1+/AAAAARnQU1BAACxjwv8YQUAAAFISURBVHjazZOvr4JQHMXPZW/TppMOc0aZiQ2DQQL8A86ZnIHkzAYyyY05KhYDf4IBJtHkP+BsBhMF/FFo13GDG0987+3NwEk3fO/nnvM9u4RSik+I+willKCvvwxtNhu63+8RxzHa7TZmsxn5PkN+Wrbv+3S1WuF8PqPb7aLRaOBwOOB2u2G73eZguWjT6fRJtW2bGoYBSZLgOA50XWfn4XCIer2OyWSSc5CLlrkbDAa00+ngeDzCsix2KUkS5qbX6zEX1WqVmqaJMAyppmmkEHS/37FYLOC6LjiOA8/z6Pf7uRhpmqJWq+FyubxvLYoiNJtNrNdriKL4Asl0Op0gCAIIIcWgzFGr1WKASqWC5XJZWMJut4Msy2zmbWue573UOB6Pc64URaHz+ZzFVlWV/Fr/OwVBQK/XK0aj0fOBf4GKVL6/Vj7QAyElepxtj8NoAAAAAElFTkSuQmCC",
	        	"error":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAB3RJTUUH3wMEDCoN/76gLAAAAAlwSFlzAAAB1wAAAdcBjJIIaAAAAARnQU1BAACxjwv8YQUAAAAwUExURQAAAOq1tb9pa6UYGL0xMf/v75wIEMoAANYAAKkMEO0XF9oODv////8cHLwWGORSUmOSmUgAAAABdFJOUwBA5thmAAAAeElEQVR42m2P2w6EQAhDpcAOy8D6/3+7oKOJiX3rgXLZtjcRwAzQ7cWz5L9FaM8lobOeFG2Dzh5IphYJrRAKSMc1Qt3nlAKc7o4IuNnkBuVnqIaZjQZSnaHTmhwRsJFW1ZTsi2PtsKVxHTIevsln9EChx3MCff38D9OKBPjbwjIoAAAAAElFTkSuQmCC",
	        	"warn":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAB3RJTUUH3wMEDCootLp0awAAAAlwSFlzAAAB1wAAAdcBjJIIaAAAAARnQU1BAACxjwv8YQUAAAAwUExURQAAAK2UOb2MIcGcWs6lMffWUvfWSvfaXq1zKWM5AOzbePPmqPzsifvrlP/3qZyEKQAaZK8AAAABdFJOUwBA5thmAAAAbklEQVR42m2OCQrAIAwETaw2Hln//9saFWuhg6y4DInO/VOYy6fwgD/fnIHMR9HQaYegVtRXIUDkmGKCJECXUghqhYLmaq5aVVKPOaVQ7UiyHAqHvImm8G2IjGsWoSPJMljhrxDjOtf4CvGGnHsAOYMEvkR41j4AAAAASUVORK5CYII=",
	        	"log":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAB3RJTUUH3wMEDCoZ5WR0UQAAAAlwSFlzAAAB1wAAAdcBjJIIaAAAAARnQU1BAACxjwv8YQUAAAAqUExURQAAALXW3hhznBh7rSmczv///87v/zGl3hiErUKt50q171rG9xiEtVK976zfCzYAAAABdFJOUwBA5thmAAAATklEQVR42pWPQQ7AIAgEpRYqgv//blmxnu2QTDZzo5QDyDc0gw/7zjNgM8MrjIAFztC6djWDWwYNWOA6Q30CFniFO2CBf4UkA10bOnn1BY/BBAgB7Qz8AAAAAElFTkSuQmCC"
			} },
	copyright: "/*\r\n* IBM Confidential \r\n* OCO Source Materials \r\n* 5724-U18, 5737-M66 \r\n* (C) COPYRIGHT IBM CORP. {mode} \r\n* The source code for this program is not published or otherwise \r divested of its trade secrets, irrespective to what has been \r deposited with the U.S. Copyright Office.\r\n*\/\r\n\r\n/* IBM Interaction Recorder output file */\r\n\r\n",
	keys: {9:{"str":"TAB"},13:{"str":"ENTER"},27:{"str":"ESCAPE"}},// ,37:{"str":"ARROW_LEFT"},38:{"str":"ARROW_UP"},39:{"str":"ARROW_RIGHT"},40:{"str":"ARROW_DOWN"}};
	assertionAttributes: {"a":["title","innerText","textContent"],"input":["value", "readonly", "title"],"img":["src", "readonly"],"button":["innerHTML","textContent"],"label":["innerHTML"],"span":["innerHTML"], "td":["innerHTML","textContent"], "textarea":["innerHTML", "value", "readonly"],"div":["title","innerText","textContent"],"th":["textContent"]},
	assertionRules: {"css":{"class":"WL_"}},
	deepAssertionAttributes: {},
	displayTemplates: {"javascript":{"default":{"interaction":" document.getElementById({id}).{event}({params}); {number} {comment}","events":{}},
		"typeover":{"interaction":" document.getElementById({id}).value={params};","events":{}}},"seleniumCode":{"default":{"interaction":"browser.{event}({id}{assert}{params}); {number} {comment}",
   		"events":{"mouseover":"moveTo"}},"assertAttributeTrue":{"interaction":"browser.{event}({id},{attribute},{value})"},"assertAttributeFalse":{"interaction":"browser.{event}({id},{attribute},{value})"},"comment":"/*{comment}*/","screenshot":{"interaction":"Logger.getScreenshot();"}}},
   	history: [],
   	commentCheck: true,
   	clickEvent: "click",
   	interactionElements: [	{"query":"BUTTON","events":["click","keypress"]},
   	                      	{"query":"A","events":["click","keypress","keydown","keypress"]},
   	                      	{"query":"INPUT","events":["click","change","keypress"]},
   	                      	{"query":"TEXTAREA","events":["click","change","keypress"]},
   	                      	{"query":"DIV","events":["click","keypress"]} ],
	extendedButtons: [],
	bindMethods: [],
	direction: "",
	debug: false,
	startWidth: "650px",
	inspecting: true,
	inspectorData: null,
	mode: "",
	lastActiveElement: null,
	defaultAlign: "left",
	reverseAlign: "right",
	useAttributes: [],
	assertHighlight: null,
	highlightHover: null,
	highlights: [],
	minVariableNameLength: 4,
	currentInteraction: -1,
	suppressNotifications: false,
	dataId: "inspectorData",
	randomTypes: {"string":{"max":12},"int":{"max":5}, "range":{"max":5}},
	dateTypes: {"":"","currentTime":"Current Time","today":"Today","daysFromToday":"Days From Today","daysBeforeToday":"Days Before Today","timeFromToday":"Time From Today","timeBeforeToday":"Time Before Today","dateTimeFromDate":"Date/Time From Date","dateTimeBeforeDate":"Date/Time Before Date","currentDayOfWeek":"Current Day of Week", "dayOfWeekFromDate":"Day of Week from Date"},
	dateFormats: {"":"","date":"date","time":"time","dateAndTime":"dateAndTime"},
	dateFormatTypes: {"MM/dd/yy":"MM/dd/yy","MM/dd/yyyy":"MM/dd/yyyy","MM-dd-yy":"MM-dd-yy","MM-dd-yyyy":"MM-dd-yyyy","dd/MM/yy":"dd/MM/yy","dd/MM/yyyy":"dd/MM/yyyy","dd-MMM-yy":"dd-MMM-yy","dd-MMM-yyyy":"dd-MMM-yyyy","yyyy-MM-dd":"yyyy-MM-dd","yyyy-MM-dd'T'hh:mm:ss":"yyyy-MM-dd'T'hh:mm:ss"},
	varNames: [],
	currentNotification: null,
	dialogStack : [],
	lastTimeStamp: null,
	currentTimeStamp: null,
    useXpath: false,
	verifyExtensions: function(){ // this is used to ensure that there is an extension that implements required methods
		if(!this.getComment){
			// used to build up comments for use in recorded interactions
			throw "getComment(/*event*/ e, /*node*/node){}";
		}
    },
    startup: function(headlessOption, url){
    	console.log("Starting base Inspector");
    	try{
    		this.verifyExtensions();
    	}
    	catch(error){
    		console.warn("Implementation: ["+error+"] should be implemented by extension.");
    		return;
    	}
		inspectorData = this.fetchInspectorData(headlessOption);
		if(!inspectorData.interactions){
			inspectorData.interactions = [];
		}
		inspectorData.options.headless = headlessOption!==undefined?headlessOption:inspectorData.options.headless;
		
		defaultAlign = (attr.get(win.body(), "dir")=="rtl")?"right":"left";
		reverseAlign = defaultAlign=="right"?"left":"right";
		this.createInspectorWindow();
		this.processBindMethods();
    	if(url){
    		inspectorData.inspectorURL = url;
    	}
        inspectorData.baseURL = url.substring(0,  url.lastIndexOf('/'));

		this.storeData();
    },
    getNodeForBinding: function(bindNode, bindMethod){
    	/* used to override base node for adding inspection points when the method may not return the correct element 
    	 * Only gets called when returned item is not a dom node, if not override, return body
    	 * */
    	if(bindMethod.elementId){
    		return dom.byId(bindMethod.elementId);
    	}
		if(bindNode.nodeType===undefined){
            var iframe = document.getElementById("manage-shell_Iframe");
            if (iframe != undefined){
            var iframedoc = document;
            return iframedoc;
            }
            else
			     return win.body();
 		}
    	return bindNode;
    },
    getTopDialog: function(){
    	return this.dialogStack[this.dialogStack.length-1];
    },
    getCallout : function(methodString){
		var methodParts = methodString.method.split(".");
		var object = window;
		if(methodParts.length>1){
			array.forEach(methodParts, function(part, index){
				if(index<methodParts.length-1){
					object = object[part];
				}
			});
		}
		return [object, methodParts[methodParts.length-1]];
    },
    processBindMethods: function(){
		if(this.bindMethods){
			var insp = this;
            var iframe = document.getElementById("manage-shell_Iframe");
            if (iframe != undefined){
                var iframedoc = document;
            }
			array.forEach(this.bindMethods, function(bindMethod){
				var callout = insp.getCallout(bindMethod);
				aspect.after(callout[0], callout[1], function(arg1) {
					try{
						bindNode = insp.getNodeForBinding(arg1.parentNode?arg1.parentNode:arg1, bindMethod);
						if(!bindNode || bindMethod.fullDoc){
                            bindNode = iframedoc;
						}
						if(bindMethod.wait){
							window.setTimeout(function(){
								insp.addInspectionPoints(bindNode);
							}, bindMethod.wait);
						}
						else {
							insp.addInspectionPoints(bindNode);
						}
					}
					catch(error){
						// do nothing, but don't break original functions
					}
				},true);
			});
		}
    },
	createInspectorWindow: function(){
		var insp = this;
		if(registry.byId("insp_inspectorDialog")){
			return;
		}
		this.createStyleSheet();
		if(insp.canRecord()){
			lastActiveElement = document.activeElement;
		}
	    this.InspectorDialog = declare(Dialog, {
	        "class":"inspectorDialog",
	        insp: insp,
	        show: function(){
	        	this.inherited(arguments);
				insp.addClearFields(this.domNode);
				insp.dialogStack.push(this);
	        },
	        hide: function(){
	        	this.inherited(arguments);
	        	insp.dialogStack.pop();
	        },
	    	showWait: insp.showWait,
	    	hideWait: insp.hideWait
	    });
	    var ModelessDialog = declare(Dialog, {
	    	insp: insp,
	    	show: function() {
	         // make sure it will be on top of all dialogs, etc...
	            Dialog._DialogLevelManager._beginZIndex = 100050; 
	            this.inherited(arguments);
	            Dialog._DialogLevelManager.hide(this);
	            insp.dialogStack.push(this);
	        },
	        hide: function(){
	        	this.inherited(arguments);
	        	insp.dialogStack.pop();
	        },
	    	showWait: insp.showWait,
	    	hideWait: insp.hideWait
	    });
		inspectorDialog = new ModelessDialog({
	    	id: "insp_inspectorDialog",
	        title: insp.resources.strings.product_name,
	        content: ''+
	        '<div id="insp_header" data-dojo-type="dijit/Toolbar" class="inspectorToolbar">'+
	        '	<div style="display:inline">'+
	        '		<button id="insp_recButton" data-method="toggleRecording" title="'+insp.resources.strings.record_pause+'">&bull;</button>'+
	        '		<button id="insp_clearButton" data-method="clearInteractions" style="padding: 2px"><img title="'+insp.resources.strings.clear+'"  style="margin: 0px" width="18" height="18" alt="" src="'+insp.resources.images.clear+'" /></button>'+
	        '		<button id="insp_undoButton" data-method="undo" style="opacity: .3; padding: 2px"><img title="'+insp.resources.strings.undo+'"  style="margin: 0px" width="18" height="18" alt="" src="'+insp.resources.images.undo+'" /></button>'+
	        '		<button id="insp_assertButton" data-method="createAssertion" style="display: none; padding: 2px"><img title="'+insp.resources.strings.assert+'" style="margin: 0px" width="18" height="18"alt="" src="'+insp.resources.images.assert+'" /></button>'+
	        '		<button id="insp_dataButton" data-method="makeVariable" style="display: none; padding: 2px"><img title="'+insp.resources.strings.get_data+'" style="margin: 0px" width="18" height="18"alt="" src="'+insp.resources.images.makevar+'" /></button>'+
	        '		<button id="insp_commentButton" data-method="createCustomComment" style="display:none;padding: 3px"><img title="'+insp.resources.strings.comment+'" style="margin: 0px" width="17" height="17" alt="" src="'+insp.resources.images.comment+'"/></button>'+
	        '		<button id="insp_screenShotButton" data-method="screenShot" style="display:none;padding: 3px"><img title="'+insp.resources.strings.screen_shot+'" style="margin: 0px" width="18" height="18" alt="" src="'+insp.resources.images.screenshot+'" /></button>'+
	        '	</div>'+
	        '	<div class="insp_tbSection" style="display:inline;">'+
	        '		<button id="insp_importButton"><img title="'+insp.resources.strings.importer+'" style="margin: 0px" width="18" height="18" alt="" src="'+insp.resources.images.importer+'" /></button>'+
	        '		<button id="insp_exportButton" data-method="exportInteractions"><img title="'+insp.resources.strings.exporter+'" style="margin: 0px" width="18" height="18" alt="" src="'+insp.resources.images.exporter+'" /></button>'+
	        '	</div>'+
	        '	<div class="insp_tbSection" id="extended_buttons" style="display:inline;">'+
	        '	</div>'+
	        '</div>'+
	        '<div id="insp_content" style="width:'+(insp.startWidth+10)+';height:200px;">'+
	        '	<ul id="insp_inspectorContentList" class="interactions"></ul>'+
	        '</div>'+
	        '<div data-dojo-type="dijit/Toolbar" class="inspectorToolbar">'+
        	'	<div id="insp_mainNotification" style="text-align: center;height:20px">&nbsp;</div>'+
	        '	<img id="insp_resizer" data-dojo-type="dojox.layout.ResizeHandle" data-dojo-props="targetId:\'insp_content\'" draggable="false" style="-webkit-user-select: none; position: absolute; right: 0px; bottom: 0px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAE5JREFUeNpi%2Bf%2F%2FPwMxwNvb24GJWIX6%2Bvr7mYhVePHiRUcmYhUCuQeYiFUIxNjdjE0hVjfjUojhZnwKUdxMSCHczcQoBLuZWIUgPkCAAQCFeVrlOKc1%2BgAAAABJRU5ErkJggg%3D%3D">'+
	        '</div>',
	        onHide: function(){
	        	inspectorDialog.destroyRecursive(false);
	        	inspectorData.inspecting = false;
	        	insp.inspecting = false;
	        	inspectorData.recording = false;
	        	delete inspectorData.inspectorURL;
	        	insp.storeData();
	        },
	        onMove : function() { 
	        	inspectorData.dialogPosition = geom.position(this.domNode);
	        	inspectorDialog._relativePosition = inspectorData.dialogPosition;
	        	insp.storeData(); 
	        },	
	        closable: true,
	        autofocus: false,
	        refocus: false,
	        "class": "inspectorDialog"
	    });
		if(inspectorData.options.headless!==true){
	        topic.subscribe("/dnd/move/stop", function(mover){
                if (mover.node.id === inspectorDialog.id){
                	inspectorDialog.onMove();
                }
            });
			if(insp.extendedButtons){
				var insertDiv = dom.byId("extended_buttons");
				array.forEach(insp.extendedButtons, function(button){
					if(button.method){
						var buttonNode = document.createElement("button");
						style.set(buttonNode, {"padding":"2px"});
						attr.set(buttonNode, {"id":"insp_customButton_"+button.method});
						if(button.image){ //should be a data url
							var img = document.createElement("img");
							attr.set(img, {"src":button.image,"title":button.label,"height":"18px","width":"18px"});
							style.set(img, {"margin":"0px"});
							buttonNode.appendChild(img);
							insertDiv.appendChild(buttonNode);
						}
						else if(button.label){
							buttonNode.innerHTML = button.label;
							insertDiv.appendChild(buttonNode);
						}
						onEvent(buttonNode, "click", function(){
							insp[button.method].apply(insp);
 						});
						if(button.enabledCheck){
					    	aspect.after(insp, "addInspectionPoints", lang.hitch(button, function(arg1) {
					    		insp.setButtonEnabled(buttonNode, this.enabledCheck());
					    	}));
						}
					}
				});
			}
			insp.processSimpleDialogButtons(inspectorDialog);
			{ // complex events
				onEvent(dom.byId("insp_importButton"), "click", function(){
					insp.confirm(insp.resources.strings.confirm_overwrite, inspectorData.interactions.length>0, function(){
						insp.importInteractionsDialog();
					}, null);
				});
				onEvent(dom.byId("insp_inspectorContentList"), "dragover", function(e){
					e.stopPropagation();
				    e.preventDefault();
				    e.dataTransfer.dropEffect = 'copy';
				});
				onEvent(dom.byId("insp_inspectorContentList"), "drop", function(e){
				    e.stopPropagation();
				    e.preventDefault();
				    var file = e.dataTransfer.files[0];
					insp.confirm(insp.resources.strings.confirm_overwrite, inspectorData.interactions.length>0, function(){
						insp.importFile(e, file, "int");
					}, null);
				});
			}
			if(inspectorData.dialogPosition){
				inspectorDialog._relativePosition = {"x":inspectorData.dialogPosition.x,"y":inspectorData.dialogPosition.y,"h":"0","w":"0"};
			}

			inspectorDialog.show();
			if(inspectorData.hidden=="true"){
				this.hide();
			}

			this.setRecordingButton();
			style.set(inspectorDialog.containerNode, {"padding":"0px"});
			this.updateContent();
			this.setCurrentInteraction(inspectorData.interactions.length-1); 
			attr.set(inspectorDialog.domNode, "dir", (defaultAlign=="left"?"ltr":"rtl"));
			style.set(inspectorDialog.closeButtonNode, {"float":reverseAlign,position:"relative","top":"0px"});
		}
        var iframe = document.getElementById("manage-shell_Iframe");
        if (iframe != undefined){
            var iframedoc = document;
            this.addInspectionPoints(iframedoc);
        }
        else
            this.addInspectionPoints(win.body());
		inspectorData.inspecting = true;
		insp.storeData();
	},
	hideNotification: function(){
		if(insp.currentNotification){
			insp.currentNotification.innerHTML = "&nbsp;";
		}
	},
	/*
	 * types ('LOG','WARN','ERROR') or (0, 1, 2)
	 * if type does not match message will default to a log
	 */
	showNote: function(noteNodeOrId, message, type){
		var insp = this;
		var noteNode = (typeof noteNodeOrId == "string")?dom.byId(noteNodeOrId):noteNodeOrId; 
		if(!noteNode){
			return;
		}
		var hide = attr.get(noteNode, "hide");
		if(hide){
			window.clearTimeout(hide);
		}
		var color = "black";
		if(typeof type == "string"){
			type = type.toLowerCase();
		}
		else {
			if(type==-1){
				type = 'note';
			}
			else { 
				try {
					type = ["log","warn","error"][type];
				} 
				catch(error){
					type = "log";
				}
			}
		}
		switch(type){
			case 'log':
				color = "#3333ff";
				break;
			case 'warn':
				color = "#ff6633";
				break;
			case 'error': 
				color = "#ff0033";
				break;
			default:
				color = "#3333ff";
				break;
		}
		noteNode.innerHTML = "<img src='"+insp.resources.images[type]+"' style='vertical-align: bottom;'/> "+message;
		style.set(noteNode, "color", color);
		this.currentNotification = noteNode;
		attr.set(noteNode, "hide", window.setTimeout(function(){
			if(insp.currentNotification){
				insp.currentNotification.innerHTML = "&nbsp;";
			}
		}, 4000));
        var iframe = document.getElementById("manage-shell_Iframe");
        if (iframe != undefined){
            var iframedoc = document;
            this.addInspectionPoints(iframedoc);
        }
        else
            this.addInspectionPoints(win.body());
	},
	showNotification: function(message, type){
		if(this.suppressNotifications){
			return;
		}
		var notificationNodeId = "insp_mainNotification";

		if(dom.byId("insp_assertionDialog")){
			notificationNodeId = "insp_assertion_info";
		}
		else if(dom.byId("insp_interactionDialog")){
			notificationNodeId = "insp_view_info";
		}
		else if(dom.byId("insp_DataDialog")){
			notificationNodeId = "insp_makeVariable_info";
		}
		else if(dom.byId("insp_importInteractionsDialog")){
			notificationNode="insp_import_info";
		}
		else if(dom.byId("insp_assertSqlDialog")){
			notificationNodeId="assertSql_dialog";
		}
		else if(dom.byId("insp_typeoverDateTimeDialog")){
			notificationNodeId="insp_dates_info";
		}
		this.showNote(dom.byId(notificationNodeId), message, type);
	},
	exportInteractions: function() {
		var insp = this;
		exportInteractionsDialog = new insp.InspectorDialog({
			id: "insp_exportInteractionsDia",
			title: "Export Interactions",
			content: ''+
			'<div class="notification" id="insp_view_info" style="text-align: center;height: 20px;">&nbsp;</div>'+
			'<div id="inspInter">'+
			'   <textarea id="insp_inspectorInteractions" readonly="readonly" spellcheck="false" rows="20" cols="140"></textarea>'+
			'</div>'+
			'<div class="inspectorToolbar" style="text-align:"'+reverseAlign+'">'+
			'	 <button id="insp_downloadNowButton" style="visibility:hidden;" data-method="download">'+insp.resources.strings.download+'</button>&nbsp;'+
			'	 <button id="insp_cancelViewButton" data-method="cancel">'+insp.resources.strings.cancel+'</button>&nbsp;'+
			'</div>',
			onHide: function(){
				exportInteractionsDialog.destroyRecursive(false);
				Dialog._DialogLevelManager.hide(exportInteractionsDialog);
			},
			onShow: function() {
				Dialog._DialogLevelManager.show(exportInteractionsDialog);
			},
			autofocus: true,
			refocus: false
		});
		insp.processSimpleDialogButtons(exportInteractionsDialog);		
		{
			onEvent(dom.byId("insp_inspectorInteractions"), "click", function(e){
				if(e.ctrlKey){
					this.value = insp.getOutput("seleniumCode");
				}
			});
		}
		dom.byId("insp_inspectorInteractions").value = this.getOutput();
		exportInteractionsDialog.show();
		var nAgt = navigator.userAgent;
		var browserName  = navigator.appName;
		if ((nAgt.indexOf("Chrome"))!=-1 || (nAgt.indexOf("Firefox")) != -1) {
			style.set(dom.byId("insp_downloadNowButton"),"visibility","visible");
		}
		insp.centerDialogOnParent(exportInteractionsDialog, inspectorDialog);
	},
	importInteractionsDialog: function() {
		var insp = this;
		importInteractionsDia = new insp.InspectorDialog({
			id: "insp_importInteractionsDialog",
			title: "Import Interactions",
			content: ''+
			'<div class="notification" id="insp_import_info" style="text-align: center;height: 20px;">&nbsp;</div>'+
			'   <div id="insp_input">'+
			'		<label>'+insp.resources.strings.import_info+'</label><br><br>'+
			'		<input type="file" id="insp_fileInput" name="insp_fileInput" style="width: 100%"/>'+
			'	</div>'+
			'	<div class="inspectorToolbar" style="text-align:'+reverseAlign+'">'+
			'		<button id = "insp_cancelViewButton" data-method="cancel">'+insp.resources.strings.cancel+'</button>&nbsp;'+
			'	</div>',
			onHide: function(){
				importInteractionsDia.destroyRecursive(false);
				Dialog._DialogLevelManager.hide(importInteractionsDia);
			},
			onShow: function() {
				Dialog._DialogLevelManager.show(importInteractionsDia);
			},
				autofocus: true,
				refocus: false
			});
			insp.processSimpleDialogButtons(importInteractionsDia);
			{
				onEvent(dom.byId("insp_fileInput"), "change", function(e){
			    var file = e.target.files[0]; // FileList object
				insp.importFile(e, file, "imp");
				});
			}
			importInteractionsDia.show();
			insp.centerDialogOnParent(importInteractionsDia, inspectorDialog);
	},
	importFile: function(e, file, d){
		var insp = this;
		// Only process text or .bin files.
		if((file.type.match('text.*') || file.type=="application/octet-stream" || file.type=="application/x-sdlc" || file.type=="application/macbinary") && (file.name.match('txt') || file.name.match('bin'))) {
			var reader = new FileReader();
			//If we use onloadend, we need to check the readyState.
			onEvent(reader, "loadend", function(e){
				if(e.target.readyState == FileReader.DONE) { // DONE == 2
					if(insp.importInteractions(e.target.result, d)){
						var dialog = registry.byId("insp_importInteractionsDialog");
						if(dialog){
							dialog.hide();
						}
						insp.storeData();
						insp.updateContent();
					}
				}
			});
			reader.readAsText(file);
		}
	},
	confirm: function(message, check, yes, no){
		var insp = this;
		if(!check || check===false){
			if(yes){
				yes.call();
			}
			return;
		}
		confirmDialog = new insp.InspectorDialog({
	    	id: "insp_confirmDialog",
	        title: '',
	        content: ''+
	        '<div class="insp_d_content">'+
	        message +
	        '	</div>'+
	        '	<div class="inspectorToolbar" style="text-align:'+reverseAlign+'">'+
	        '		<button id="insp_confirmYesButton">'+insp.resources.strings.yes+'</button>&nbsp;'+
	        '		<button id="insp_confirmNoButton">'+insp.resources.strings.no+'</button>&nbsp;'+
	        '	</div>',
	        onHide: function(){
	        	confirmDialog.destroyRecursive(false);
	        	Dialog._DialogLevelManager.hide(confirmDialog);
	        },
	        onShow: function(){
	    		Dialog._DialogLevelManager.show(confirmDialog);
	        },
	        autofocus: true,
	        refocus: false
	    });
		{ //complex events
			onEvent(dom.byId("insp_confirmYesButton"), "click", function(){
				confirmDialog.hide();
				if(yes){
					yes.call();
				}
			});
			onEvent(dom.byId("insp_confirmNoButton"), "click", function(){
				confirmDialog.hide();
				if(no){
					no.call();
				}
			});
		}
		confirmDialog.show();
		insp.centerDialogOnParent(confirmDialog, inspectorDialog);
	},
	importInteractions: function(interactionString, d){
		try {
			/* Interaction Recorder output file: Selenium */
			
			//just convert it to JSON! Seems a problem with comments			
			interactionString = interactionString.trim();
			var lines = interactionString.split("\n");
			var importString = "";
			var inArray = false;
			for(lineIndex = 0; lineIndex<lines.length;lineIndex++){
				var line = lines[lineIndex].trim();
				if(line=="{"){
					inArray = true;
					continue;
				}
				if(inArray){
					if(line=="}"){
						break;//done
					}
					if(line.indexOf("/*") === 0 || line.indexOf("//") === 0 ){
						var comment = line.substring(2);
						if(comment.indexOf("*/") == comment.length-2){
							comment = comment.substring(0, comment.length-2);
						}
						line = '{"comment":"'+comment+'"},';	
					}
					importString += line;
				}
			}
			importString = importString.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, "");
			importString = importString.replace(/\n/gm, "");
			
			if(importString.charAt(importString.length-1)==","){
				importString = importString.substring(0,importString.length-1);
			}
			importString = "{"+importString+"}";
			var binObject = JSON.parse(importString);
			var interactions = binObject["interactions"];
			array.forEach(interactions, function(interaction){
				if((!interaction["event"] && !interaction["id"]) && !interaction["comment"]){
					throw "error";
				}
			});
			inspectorData.interactions = interactions;
			inspectorData.binConfiguration = binObject["configuration"];
			return true;
		}
		catch(error){
			if (d === "inter")
				this.showNotification(this.resources.strings.invalid_interactions, 2);
			else if (d === "imp")
			{
				var insp = this;
				insp.showNotification(this.resources.strings.invalid_interactions, 2);
			}
		}
		return false;
	},
	createStyleSheet: function(){
		var styleSheet = (function() {
			var style = document.createElement("style");
			style.appendChild(document.createTextNode(""));
			document.head.appendChild(style);
			return style.sheet;
		})();
		/* STYLESHEETS */

		styleSheet.insertRule(".inspectorDialog *, .inspectorDialog *:before, .inspectorDialog *:after { -moz-box-sizing: border-box;-webkit-box-sizing: border-box;box-sizing: border-box; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog, .inspectorDialog textarea, .inspectorDialog ul  { border-radius: 1px !important; opacity: .9 !important }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog { rgb(153, 153, 153) 1px 1px 12px, opacity: .9 !important;}", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .insp_d_content { padding: 10px; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorToolbar { padding: 5px; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorToolbar button { width: auto !important; font-family: arial, min-width: 25px !important; verdana; "+
				"padding: 1px 5px; margin: 2px; font-size: 13px; color: black;  height: 25px; line-height: 10px; vertical-align: top;}", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorToolbar button.record { font-weight: bold; font-size: 40px; color: red; padding: 1px 4px 2px 4px }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorToolbar button.pause { font-weight: bold; font-size: 10px; color: black; padding: 2px 2px 2px 6px }", styleSheet.cssRules.length);
				styleSheet.insertRule(".symbolButton { width: 25px !important; font-size: 20px !important; padding: 0px 4px 4px 4px !important; }", 4);
		styleSheet.insertRule(".inspectorDialog textarea, .inspectorDialog .interactions { white-space: pre-wrap; cursor: default; line-height: 15px; opacity: .9;"+
				"min-width: 450px; height: 100%; overflow-y: auto; overflow-x: hidden; margin: 0px; padding: 0px;  font-family: arial, verdana; font-size: 13px; "+
				"direction: "+this.direction+"; text-align: "+defaultAlign+"; border: 0px}", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .interactionNum { font-family:verdana; font-size:9px;display:inline-table; border:1px solid #999;"+
				"border-radius:20px; height:18px;width:15px;text-align:center;padding: 0px 2px;min-width: 20px;text-align: center;margin: 0px 2px 0px 0px;"+
				"border-radius: 15px;", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog button:hover { box-shadow: 0px 0px 1px #999; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .deleteInteraction { font-weight: bold; color: #fff; background-color: rgb(224, 48, 9);}", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog fieldset { padding: 5px 10px; border: 1px solid #999; border-radius: 2px; margin: 10px; padding: 10px; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .dataList { height: 200px; overflow-y: auto; display: inline; border-color: #999; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .dataList table { width: 100%; border-collapse: collapse; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .dataList table tr:first-child td { border-top: 0;  border-color: #C0C0C0; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .dataList table tr:last-child td {   border-color: #C0C0C0; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .dataList table tr td:first-child, .dataList table tr th:first-child { "+
				"white-space: nowrap; padding: 0px 3px; text-align: right; border-left: 0;  border-color: #C0C0C0;}", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .dataList table tr td:last-child, .dataList table tr th:last-child { "+
				"white-space: normal; padding: 0px 3px; border-right: 0;  border-color: #C0C0C0; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .dataList td, .dataList th { font-family: arial, font-size: 10px; "+
				"padding: 0px 5px; border-color: #c0c0c0; border-color: #C0C0C0; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .dataList tr td:nth-child(2) { white-space: nowrap; text-align: right; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .notification { text-align: middle; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .interactions .id{  }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .interactions .event{ font-weight: bold; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .interactions .comment{ color: rgb(97, 163, 97); font-size: 11px;  }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .interactions .params{ color: rgb(43, 109, 181); font-size: 11px; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .interactions .variable{ color: rgb(138, 12, 101); font-weight:bold !important; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .interactions li { padding: 1px; border: 1px solid transparent; font-size: 1em;line-height: 1.5em;margin: 0; -webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none; white-space: nowrap; width: 100%;overflow: hidden;text-overflow: ellipsis;-o-text-overflow: ellipsis;-webkit-text-overflow: ellipsis;", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .interactions li.int_hover { background-color: rgb(222, 231, 238); }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .interactions li.int_hover img { -webkit-filter:grayscale(0%) !important;-moz-filte:grayscale(0%) !important; filter:grayscale(0%) !important; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .interactions li.current { background-color: rgb(217, 233, 247); border: 1px solid #999; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".interactions li.int_hover .interactionNum{ box-shadow: 0px 0px 1px 2px orange ;}", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .insp_tbSection { border-left: 1px #bbb solid; padding-left: 5px; padding-bottom: 15px; margin-left: 5px; }", styleSheet.cssRules.length);
		styleSheet.insertRule("#insp_inspectorInteractions { font-size: 11px }", styleSheet.cssRules.length);
		styleSheet.insertRule(".dojoxResizeHandleClone { z-index: 9999999 !important; }", styleSheet.cssRules.length);
		
		styleSheet.insertRule(".inspectorDialog { border: 1px solid rgb(153, 153, 153); padding: 3px; background: rgb(231, 231, 231);}", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog ul { border: 1px solid rgb(153, 153, 153) !important; border-width: 1px 0px !important; padding: 2px; background: rgb(255, 255, 255);}", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .dijitDialogTitleBar { font-size: 15px; text-shadow: 1px 1px 2px #fff; cursor: move; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .closeText { padding: 0px 5px; cursor: default; float: right; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".dojoxResizeHandle { float: right; position: absolute; right: 2px; bottom: 2px; width: 13px; height: 13px; z-index: 20; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAAtUlEQVR42mL8//8/AyUAIICYGCgEAAFEtAFnz551AuKTQJyALA4QQKS4oA6IzYC4C1kQIIBIMWAZEP+F0nAAEECMlAYiQACx4PMzkGoH4unGxsYLZs2aBeenpaUtgKkDCCAmEvyMNQwAAoiJBD9jDQOAAKI4DAACiAlXPKenpzsB8UkgBvMZGRmdgPgkEKOkA4AAYiLBz1jDACCAmEjwM9YwAAggisMAIIAozkwAAUSxAQABBgCBl0L7jJdTdgAAAABJRU5ErkJggg==); line-height: 0px; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".dojoxResizeHandleClone { position:absolute; top:0; left:0; border:1px dashed #666; z-index:999; }", styleSheet.cssRules.length);
		styleSheet.insertRule(".dojoxResizeNW { cursor: nw-resize;	}", styleSheet.cssRules.length);
	
		styleSheet.insertRule(".dijitDialogUnderlayWrapper { position: absolute;left: 0;top: 0;z-index: 998;display: none;background: transparent !important;}", styleSheet.cssRules.length);

		
		styleSheet.insertRule(".inspectorDialog .tabGroup {display: inline-block;list-style-type: none;border-width: 0px !important;padding: 0px;margin-bottom:0px}", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .tabGroup li {float: left;padding: 3px 10px; background: #e7e7e7; display: inline;border: 1px solid #999;margin: 0px 1px;border-radius: 3px 3px 0px 0px}", styleSheet.cssRules.length);
		styleSheet.insertRule(".inspectorDialog .tabGroup li.current { border-top:1px solid blue; font-weight:bold; background: #fff; border-bottom:0px }", styleSheet.cssRules.length);
	
	},
	screenShot: function(){
		this.addInteractionNoCheck(null, {"event":"screenshot"});
		this.storeData();
	},
	setCurrentInteraction: function(number){
		if(number>inspectorData.interactions.length-1){
			return;
		}
		if (inspectorData.options.headless !== true)
		{	
			var list = dom.byId("insp_inspectorContentList");
			if(this.currentInteraction>=0){
				try{ //in case it has been deleted
					domClass.remove(query("li", list)[this.currentInteraction], "current");
				}
				catch(error){}
			}
			this.currentInteraction = number;
			if(this.currentInteraction>=0){
				domClass.add(query("li", list)[this.currentInteraction], "current");
				(query("li", list)[this.currentInteraction]).scrollIntoView();
			}
		}
		else
		{
			this.currentInteraction = number;
		}
	},
	addInteractionToContent: function(interactionNum){
		if(inspectorData.options.headless===true){
			return;
		}
		
		var clonedInteraction = JSON.parse( JSON.stringify( inspectorData.interactions[interactionNum] ) );
	
		delete clonedInteraction["type"];
		delete clonedInteraction["date"];
		var interactionDisplay = "";
		if(clonedInteraction.event){
			interactionDisplay += "<span class=\"event\">"+clonedInteraction.event+"</span>";
			if(clonedInteraction.event.indexOf("assert")===0){
				interactionDisplay += " ("+clonedInteraction.attribute + (clonedInteraction.event.toLowerCase().indexOf("true")>=0?" == ":" != ") + " \"" + clonedInteraction.value + "\")";
			}
		}
		var paramDisplay = null;
		if(clonedInteraction.params && clonedInteraction.params.length>0){
			var len = clonedInteraction.params.length;
			var params = "";
			array.forEach(clonedInteraction.params, function(param, index){
				if(typeof param != "boolean"){
					param = "\""+param+"\"";
				}
				params += param;
				if(index<len-1){
					params +=", ";
				}
			});
			paramDisplay = params ;
			interactionDisplay += "(<span class=\"params\">"+paramDisplay+"</span>)";
		}
		if(clonedInteraction.comment){
			interactionDisplay += (interactionDisplay.length>2?" - ":"")+"<span class=\"comment\">"+clonedInteraction.comment+"</span>";
		}

		var content = dom.byId("insp_inspectorContentList");
		var li = document.createElement("li");
		var title = "";
		title = (clonedInteraction.id?clonedInteraction.id+"\n":"")+(clonedInteraction.event?clonedInteraction.event:"")+(paramDisplay?"("+paramDisplay+")\n":"")+(clonedInteraction.comment?clonedInteraction.comment:"");
		attr.set(li, {"number":interactionNum, "title":title, "draggable":"true"});
		var number = document.createElement("div");
		var interactionNumDisplay = interactionNum + 1;
		number.innerHTML = interactionNumDisplay;
		attr.set(number, {"class":"interactionNum","number":interactionNumDisplay,"title":this.resources.strings.remove});
		if(interactionNumDisplay>99){
			style.set(number, "font-size", "7px");	
		}
		style.set(number, {"cursor":"pointer"});	
		li.innerHTML += this.colorInteractionDisplayVars(interactionDisplay).replace(/(\r\n|\n|\r|\t)/gm,"");
		var moveButton = document.createElement("img");
		attr.set(moveButton, {"title":"","src":this.resources.images.move});
		style.set(moveButton, {"vertical-align":"middle","margin":"0px","cursor":"ns-resize"});
		var editButton = document.createElement("img");
		attr.set(editButton, {"title":this.resources.strings.edit,"src":this.resources.images.edit});
		style.set(editButton, {"vertical-align":"middle","cursor":"pointer", "margin":"0px","-webkit-filter":"grayscale(80%)","-moz-filter":"grayscale(80%)","filter":"grayscale(80%)"});
		li.insertBefore(editButton, li.firstChild);
		li.insertBefore(number, editButton);
		li.insertBefore(moveButton, li.firstChild);
		var insp = this;
		onEvent(editButton, "click", function(){
			insp.editInteraction(parseInt(attr.get(this.parentNode, "number")));
		});
		onEvent(editButton, "mousedown", function(e){
			e.stopPropagation();
		});
		onEvent(number, "mouseover", function(){
			this.innerHTML = "X";
			domClass.add(this, "deleteInteraction");
		});
		onEvent(number, "mouseout", function(){
			number.innerHTML = attr.get(this, "number");
			domClass.remove(this, "deleteInteraction");
		});
		onEvent(number, "mousedown", function(e){
			e.stopPropagation();
		});
		onEvent(number, "click", function(e){
			e.stopPropagation();
			insp.saveHistory();
			var myNumber = parseInt(attr.get(this, "number"))-1;
			var event = inspectorData.interactions[myNumber].event;
			onEvent.emit(this.parentNode, "mouseout", {
				cancelable: false,
				bubbles: true
			});
			insp.deleteInteraction(myNumber);
			var message = insp.resources.strings.removed.replace("{event}", event?event:insp.resources.strings.comment.toLowerCase());
			insp.showNotification(message+" "+myNumber, 0);
		});
		var mover = new move.constrainedMoveable(li,{
			handle: moveButton,
	        constraints: function(info){ 
	        	var cb = geom.getContentBox(info.node.parentNode);
	        	cb.t = 60;
	        	cb.h = info.node.offsetHeight * inspectorData.interactions.length;
	        	return cb;
	        },
        	within : true
	    });
		onEvent(mover, "MoveStart", function () {
			var mover = this;
			mover.cloned = mover.node.cloneNode(true);
			style.set(mover.node, {"zIndex":"9999999"});
			if(mover.node.nextSibling){
				mover.node.parentNode.insertBefore(mover.cloned, mover.node.nextSibling);
			}
			else {
				mover.node.parentNode.appendChild(mover.cloned);
			}
			attr.set(mover.cloned, {"id":attr.get(mover.node,"id")+"_clone"});
			style.set(mover.cloned, {"display":"none"});
			window.setTimeout(function(){
				style.set(mover.cloned, {"opacity":".3","display":""});	
			},50);
		});
		onEvent(mover, "MoveStop", function () {
			var pos = geom.position(this.node);
			style.set(this.node, {"display":"none"});
			var dropOn = document.elementFromPoint(pos.x+10, pos.y+10);
			style.set(this.node, {"display":""});
			while(dropOn.tagName!="LI"){
				dropOn = dropOn.parentNode;
			}
			var dropNumber = parseInt(attr.get(dropOn, "number"));
			var moveNumber = parseInt(attr.get(this.node, "number"));
			if(dropNumber != moveNumber){
				insp.saveHistory();
				var moveInteraction = inspectorData.interactions.splice(moveNumber, 1)[0];
				inspectorData.interactions.splice(dropNumber, 0, moveInteraction);
			}
			insp.storeData();
			insp.updateContent();
			insp.setCurrentInteraction(dropNumber);
		});
		onEvent(li, "mouseover", function(){
			domClass.add(this, "int_hover");
			var node = dom.byId(clonedInteraction.id);
			if(node){
				insp.addHighlight(node, "2px solid orange");
			}
		});
		onEvent(li, "dblclick", function(){
			var runNumber = parseInt(attr.get(this.node, "number"));
			var interaction = inspectorData.interactions[runNumber];
			var node = dom.byId(interaction.id);
			var event = interaction.event; 
			if(node && event){
				onEvent.emit(node, event, {
					cancelable: false,
					bubbles: true
				});
			}
		});
		onEvent(li, "mouseout", function(){
			domClass.remove(this, "int_hover");
			insp.removeHighlights();
		});
		onEvent(li, "click", function(){
			insp.setCurrentInteraction(parseInt(attr.get(this, "number")));
		});

		try{
			content.insertBefore(li, query("li", content)[interactionNum]);
		}
		catch(error){ //no items or is going at end
			content.appendChild(li);
		}
		var insert = this.resources.strings.middle_insert +" "+(interactionNum+1);
		var type = inspectorData.interactions[interactionNum].event;
		if(!type || type=="undefined"){
			if(inspectorData.interactions[interactionNum].comment){
				type = insp.resources.strings.comment;
			}
			else {
				type = insp.resources.strings.interaction;
			}
		}
		this.showNotification(insert.replace("{event}", type), 0);
	},
	colorInteractionDisplayVars: function(interactionDisplay){
		interactionDisplay = interactionDisplay.replace(/\[/g, " <span class='variable'>");
		interactionDisplay = interactionDisplay.replace(/\]/g, "</span> ");
		return interactionDisplay;
	},
	reNumberInteractionList: function(){
		var content = dom.byId("insp_inspectorContentList");
		query(".interactionNum", content).forEach(function(node, index){
			attr.set(node, {"number":index+1,"innerHTML":index+1});
			attr.set(node.parentNode, {"number":index});
		});
	},
	clearContent: function(){
		if(inspectorData.options.headless===true){
			return;
		}
		var content = dom.byId("insp_inspectorContentList");
		content.innerHTML = "";
	},
	deleteInteraction: function(interactionNumber){
		inspectorData.interactions.splice(interactionNumber,1);
		this.storeData();
		if (inspectorData.options.headless !== true)
		{	
			var ul = dom.byId("insp_inspectorContentList");
			ul.removeChild(query("li", ul)[interactionNumber]);
			this.reNumberInteractionList();
			if(this.currentInteraction>-1){
				if(this.currentInteraction>=interactionNumber){
					this.setCurrentInteraction(this.currentInteraction - 1);
				}
			}
		}
		else
		{
			if (this.currentInteraction>-1){
				if (this.currentInteraction>=interactionNumber){
					this.setCurrentInteraction(this.currentInteraction - 1);
				}
			}	
		}
	},
	getInteractionDisplay: function(index, override){
		var interaction = inspectorData.interactions[index];			
		if(!interaction){
			return;
		}
		if(!this.debug){
			if(interaction.timeStamp){
				delete interaction.timeStamp;
			}
			if(interaction.eventType){
				delete interaction.timeStamp;
			}
		}
		var interactionType = interaction["type"];
		var mode = override?override:"default";

		// build the interaction depending on mode
		var template = this.displayTemplates[mode];
		if(!template){
			var reOrderInteraction = {};
			reOrderInteraction.index=interaction.index;
			//Stringify will shows FIFO
			reOrderInteraction["index"] = index;
			Object.keys(interaction).forEach(function(key) {
				reOrderInteraction[key] = interaction[key];
			});
			var tempInteraction = JSON.parse( JSON.stringify( reOrderInteraction ) );
			if(tempInteraction.event=="makeVariable"){
				delete tempInteraction.comment;
			}
			if(tempInteraction.comment){
				tempInteraction.comment = tempInteraction.comment.replace(/(\r\n|\n|\r|\t)/gm,"");
			}

			var returnString = JSON.stringify(tempInteraction)+(interaction!=inspectorData.interactions[inspectorData.interactions.length-1]?",":""); 
			if(interaction.event){
				returnString = "\t\t"+returnString;
			}
			return returnString;
		}
		
		var templateEvent = template[interaction.event];
		if(!templateEvent){
			if(interaction.comment && Object.keys.length==1){
				templateEvent = template["comment"];	
			}
			templateEvent = template["default"];
		}
		var templateInteraction = templateEvent.interaction;
		var paramsAfterId = (templateInteraction.indexOf("{params}") == templateInteraction.indexOf("{id}")+4) && interaction.params && interaction.params.length>0;  
		templateInteraction = templateInteraction.replace("{id}", interaction.id?"\""+interaction.id+"\""+(paramsAfterId?",":""):"");
		if(templateEvent.events){
			templateInteraction = templateInteraction.replace("{event}", templateEvent.events[interaction.event]?templateEvent.events[interaction.event]:interaction.event);
		}
		if(templateEvent.xpath){
			templateInteraction = templateInteraction.replace("{xpath}", interaction.xpath?interaction.xpath:"");
		}
// Not sure the number adds any value especially when we may combine files. this would make more sense if we make it so no java editing is required (load steps from text files).
		templateInteraction = templateInteraction.replace("{number}", "");
		templateInteraction = templateInteraction.replace("{assert}", interaction.assert?interaction.assert:"");
		var params = "";
		if(interaction.params){
			array.forEach(interaction.params, function(param, index){
				if(interaction.id || index>0){
					params += ", ";
				}
				params += "\""+param+"\"";
			});
		}
		templateInteraction = templateInteraction.replace("{params}", params);
		var comment = "/* "+(interaction.comment?interaction.comment:"")+"  "+(new Date(interaction.date)).toLocaleTimeString() +" */";
		templateInteraction = templateInteraction.replace("{comment}", comment);
		if(interaction.attribute){
			templateInteraction = templateInteraction.replace("{attribute}", "\""+interaction.attribute+"\"");
			templateInteraction = templateInteraction.replace("{value}", "\""+interaction.value+"\"");
			templateInteraction = templateInteraction.replace("{event}", interaction.event);
		}
		return templateInteraction.replace(/(\r\n|\n|\r|\t)/gm,"");
	},
	updateContent: function(){
		this.clearContent();
	    var inspector = this;
	    this.suppressNotifications = true;
	    array.forEach(inspectorData.interactions, function(interaction, index){
    		inspector.addInteractionToContent(index);
	    });
	    this.suppressNotifications = false;
	},
	getOutput: function(override){
    	var length=0;
    	var output = "";
    	array.forEach(inspectorData.interactions, function(interaction, index){
    		var add = this.getInteractionDisplay(index, override).replace(/(\r\n|\n|\r)/gm,"");
    		if(add.length>0){
    			output += "\t\t"+add+"\r\n";
    		}
	    }, this);
	    
	    var outputType = "";
	    if(!outputType || outputType == "none"){
	    	outputType = "";
	    }
	    else {
	    	outputType = ": "+outputType.charAt(0).toUpperCase() + outputType.slice(1);
	    }
	    var config = inspectorData.binConfiguration?inspectorData.binConfiguration:{};
	    var configuration = "\t\"configuration\":" + JSON.stringify(config, null, '		') + ",\r\n";//configuration\": {\r\n\t},\t\r\n";
	    var copyright = this.copyright.replace("{mode}", outputType);
	    var year = new Date().getFullYear();
	    var copyright = this.copyright.replace("{mode}", year);
	    return copyright + "{\r\n"+configuration+"\t\"interactions\":\t\t[\r\n" + output.replace(/&nbsp;/g, " ") + "\t]\r\n}";
	},
	download: function(){
		var createDate = new Date();
		var year = createDate.getFullYear();
		var month = (createDate.getMonth()+1)+"";
	    while (month.length < 2){
	        month = "0" + month;
		}
		var day = createDate.getDate()+"";
	    while (day.length < 2){
	        day = "0" + day;
		}
	    var hours = createDate.getHours()+"";
	    while (hours.length < 2){
	    	hours = "0" + hours;
		}
	    var minutes = createDate.getMinutes()+"";
	    while (minutes.length < 2){
	    	minutes = "0" + minutes;
		}
	    var seconds = createDate.getSeconds();
	    while (seconds.length < 2){
	    	seconds = "0" + seconds;
		}
		var output = this.getOutput();
    	var length = output.length;
		var fileName = "Recording_"+year+month+day+"-"+hours+"_"+minutes+"_"+seconds+".bin";
		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;	
        var textFileAsBlob = new Blob([output], {type:'text/plain'});
        
        var downloadLink = document.createElement("a");
        downloadLink.download = fileName;
        downloadLink.innerHTML = "Download File";            
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.target = '_blank';
        downloadLink.onclick = function () {
            this.parentNode.removeChild(this);
        };
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
	},
	getKey: function(node, keyCode, mods){
		var match = false;
		lookupKey = this.keys[keyCode];
		if(lookupKey){
			lookupMods = lookupKey["mods"];
			if(lookupMods){
				if(lookupMods == mods){
					match = true;
				}
			}
			else {
				match = true;
			}
		}
		if(match){
			return lookupKey["str"];
		}
		return null;
	},
	toggleRecording: function(){
		inspectorData.recording = !inspectorData.recording;
		this.setRecordingButton();
		this.storeData();
	},
	setRecordingButton: function(){
		var button = dom.byId("insp_recButton");
		button.innerHTML = (inspectorData.recording)?"&#9612;&#9612;":"&bull;";
		attr.set(button, "class", ((inspectorData.recording)?"pause":"record"));
	},
	missingId: function(e, node){
		if(!e || !node || (!node.id && e.target != e.currentTarget)){
			return;
		}
		var tempNode;
		try{
			tempNode = node.cloneNode();
			tempNode.innerHTML = "...";
		}
		catch(error){}
		var eventString = (e?e.type:"")+"-"+e.currentTarget.id;
		if(e.currenTarget!=e.target){
			eventString += ": "+this.resources.strings.bubbled_from+" "+e.target.id;	
		} 
		this.log("TODO - "+this.resources.strings.missing_id+" : xPath='"+this.getXpath(node)+"' : "+this.resources.strings.cannot_record+"["+eventString+"]*/\r\n/*"+ (tempNode?tempNode.outerHTML.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):this.getComment(null, e, node)), 1);
		this.showNotification(this.resources.strings.missing_id+":"+this.resources.strings.cannot_record, 2);
		if(e){
			e.recorded = true;
		}
	},
	getElementText: function(node, val){
		var childNodes = node.childNodes;
		var text = "";
		array.forEach(childNodes, function(child){
			if(child.nodeType==3){
				 text = child.data;
			}
		});
		return text;
	},
	addXpath: function(node){
		var interaction =  inspectorData.interactions[this.currentInteraction];
		// only store xpath if no id is present
		if(interaction.id && interaction.id.length>0){
			return "";
		}
		var xpath = this.getXpath(node);
		if(xpath.trim().length>0){
			interaction.xpath = xpath;
			this.storeData();		
		}
	},
	getXpath: function(node){
		var xpath = "";
		var innerText = "";
		var tag = node.tagName;
		switch(tag){
			case "A":
			case "DIV":
			case "LABEL":
			case "SPAN":
				//innerText Elements
				xpath = "//"+tag.toLowerCase();
				innerText = this.getElementText(node).trim();
				//a[text()='Users']
				break;
		}
		if(xpath.length>0 && innerText.length>0){
			xpath += "[text()='"+innerText+"']";
		}
		else {
			xpath += "[@class='"+attr.get(node,"class")+"']";
		}
		return xpath;
	},
	validateAssertion: function(value, useAttributes){
		if(value===""){
			return false;
		}
        if (this.assertHighlight.nodeName == "P" && this.assertHighlight.parentNode.nodeName == "DIV" && this.assertHighlight.parentNode.parentNode.parentNode.className !== "mx--text-required" && this.assertHighlight.parentNode.parentNode.parentNode.parentNode.parentNode.className !== "mx--text-required" && this.assertHighlight.className.indexOf("mx--label mx-body-short-01") === -1 && this.assertHighlight.className !== "mx--radio-buttons-fieldset")
            useAttributes.push("style");
        else if (this.assertHighlight.nodeName.toLowerCase() === "svg")
            useAttributes.push("title");
        else if (this.assertHighlight.nodeName.toLowerCase() === "iframe"){
            useAttributes.push("innerHTML");
            useAttributes.push("style");
            useAttributes.push("textContent");
        }
        else if (this.assertHighlight.nodeName.toLowerCase() === "label" && this.assertHighlight.className === "bx--label" && this.assertHighlight.parentNode.parentNode.parentNode.parentNode.tagName.toLowerCase() === "div" && this.assertHighlight.parentNode.parentNode.parentNode.parentNode.className === "mx--text-required")
            useAttributes.push("required");
        else if (this.assertHighlight.nodeName.toLowerCase() === "p" && this.assertHighlight.className.indexOf("mx--label field-label") > -1 && this.assertHighlight.parentNode.parentNode.parentNode.tagName.toLowerCase() === "div" && (this.assertHighlight.parentNode.parentNode.parentNode.className === "mx--text-required" || this.assertHighlight.parentNode.parentNode.parentNode.parentNode.parentNode.className === "mx--text-required"))
            useAttributes.push("required");
        else if (this.assertHighlight.nodeName.toLowerCase() === "span" && this.assertHighlight.className === "bx--list-box__label"){
            useAttributes.push("required");
            useAttributes.push("className");
        }
        else if (this.assertHighlight.nodeName.toLowerCase() === "p" && this.assertHighlight.className.indexOf("mx--label") > -1 && (this.assertHighlight.parentNode.className === "mx--text-required" || this.assertHighlight.parentNode.parentNode.parentNode.className === "mx--text-required"))
            useAttributes.push("required");
        else if (this.assertHighlight.className === "bx--header__name"){
        	useAttributes.push("bx--header__name--prefix");
        	useAttributes.push("iot--header__subtitle");
        }
        else if (this.assertHighlight.tagName.toLowerCase() === "button" && this.assertHighlight.className.indexOf("bx--content-switcher-btn") > -1)
            useAttributes.push("aria-selected");
        else if (this.assertHighlight.tagName.toLowerCase() === "button" && this.assertHighlight.className.indexOf("iot--progress-step-button") > -1)
            useAttributes.push("title");
        else if (this.assertHighlight.nodeName.toLowerCase() === "fieldset" && this.assertHighlight.className === "mx--radio-buttons-fieldset")
            useAttributes.push("innerHTML");
        else if (this.assertHighlight.tagName.toLowerCase() === "div" && this.assertHighlight.className.indexOf("maximo-toggle-button") > -1){
            useAttributes.push("aria-checked");
            useAttributes.push("aria-readonly");
        }
        
		var equals = value.indexOf("==");
		var notEquals = value.indexOf("!=");
	    if((equals>0 && notEquals<0) || (equals<0 && notEquals>0)){
	    	var prop = value.substring(0, (equals>notEquals?equals:notEquals));
	    	prop = prop.trim();
	    	var propCheck = prop;
	    	if(prop.indexOf(".")>0){
	    		propCheck = prop.substring(0,prop.indexOf("."));
	    	}
	    	var valid = (prop.length> 0 && useAttributes.indexOf(propCheck)>-1);
	    	var val = value.substring((equals>notEquals?equals:notEquals)+2).trim();
	    	if(val.substring(0,1)!="\"" || val.substring(val.length-1)!="\""){
	    		valid = false;
	    	}
	    	return valid;
	    }
	    return false;
	},
 	addAssertion: function(){
		try {
			var aText = dom.byId("insp_assertionText");
			var assertion = aText.value;
            var useXpath = false;
            if (this.assertHighlight.nodeName.toLowerCase() != "svg"){
                if (this.assertHighlight.className === "bx--form__helper-text" || this.assertHighlight.className.indexOf("bx--toggle__text") > -1 || (this.assertHighlight.nodeName === "P" && this.assertHighlight.className === "bx--form-item mx--label" && assertion.substring(0, split).trim().indexOf("style") > -1) || this.assertHighlight.className === "bx--form-item bx--text-input-wrapper" || this.assertHighlight.className === "mx--toggle bx--form-item" || this.assertHighlight.className === "bx--tabs__nav-item" || this.assertHighlight.className === "bx--list-box__label" || this.assertHighlight.className === "bx--label" || this.assertHighlight.className.indexOf("mx-label-theme-header") > -1 || this.assertHighlight.className === "bx--accordion__title" || this.assertHighlight.className === "bx--toggle-input__label" || this.assertHighlight.parentNode.className === "bx--table-header-label")
                    useXpath = true;
                else if (this.assertHighlight.className.indexOf("TableBodyRow__StyleNestedSpan") > -1 || this.assertHighlight.className === "bx--checkbox-label-text" || this.assertHighlight.className.indexOf("bx--modal-header__heading") > -1 || this.assertHighlight.className.indexOf("bx--btn bx--btn--") > -1 || this.assertHighlight.className.indexOf("table-toolbar-secondary-title") > -1 || this.assertHighlight.className === "mx--no-data-text" || (this.assertHighlight.nodeName.toLowerCase === "p" && this.assertHighlight.className.indexOf("mx--label mx-body-short-01") === -1) || this.assertHighlight.className.indexOf("ValueRenderer__AttributeValue") > -1 || this.assertHighlight.className.indexOf("ValueCard__AttributeLabel") > -1)
                    useXpath = true;
                else if (this.assertHighlight.className === "bx--toggle__switch" || this.assertHighlight.className.indexOf("bx--form-requirement") > -1 || this.assertHighlight.className === "iot--card--title--text" || this.assertHighlight.className.indexOf("iot--gauge-trend") > -1 || this.assertHighlight.className.indexOf("iot--data-state-container") > -1 || this.assertHighlight.className === "mx--dialog-content-body" || this.assertHighlight.className.startsWith("mx--WrappedText") || this.assertHighlight.className === "mx--company-name" || this.assertHighlight.className === "mx--product-name-adaptive" || this.assertHighlight.className === "mx--product-name")
                    useXpath = true;
                else if (this.assertHighlight.className === "mx--application-name" || this.assertHighlight.className === "bx--header__name" || this.assertHighlight.className === "mx--dialog-bmx" || this.assertHighlight.className === "iot--empty-state--title" || this.assertHighlight.className.indexOf("iot--progress-step-button") > -1 || this.assertHighlight.className.indexOf("iot--progress-text-label") > -1 || this.assertHighlight.className === "bx--side-nav__item" || this.assertHighlight.className === "bx--radio-button__label" || this.assertHighlight.tagName.toLowerCase() === "h2" || this.assertHighlight.className === "bx--batch-summary__para")
                    useXpath = true;
            }
            else if (this.assertHighlight.nodeName.toLowerCase() === "svg" && (this.assertHighlight.parentNode.className.indexOf("bx--tile__checkmark") > -1 || this.assertHighlight.parentNode.className.indexOf("IconWrapper") > -1 || this.assertHighlight.parentNode.className === "iot--value-card__attribute-threshold-icon-container") || this.assertHighlight.parentNode.className.indexOf("iot--gauge-container") > -1)
                useXpath = true;
            if(!this.assert)
			if(this.assertHighlight.id || useXpath){
				if(this.validateAssertion(assertion, this.getUseAttributes(this.assertHighlight))){
					var assertTrue = assertion.indexOf("==");
					var assertFalse = assertion.indexOf("!=");
					if(assertTrue>0 || assertFalse>0){
						var split = assertTrue>0?assertTrue:assertFalse;
						var assertionAttribute = assertion.substring(0, split).trim();
						var assertionValue = assertion.substring(split+2).trim().replace(/"/gm, "");
						var commentValue = "";
						var comment = dom.byId("insp_assertionComment");
						if(comment){
							commentValue = comment.value;
						}
						if(commentValue.trim().length === 0){
							commentValue = this.buildComment(null, null, this.assertHighlight);
						}
						{// allow it to be added, turn it back off after
							inspectorData.recording=true;
                            var hasClassProp = false;
                            var hascls = this.assertHighlight.className.length;
                            if (hascls > 0)
                                hasClassProp = true;
                            if (!useXpath)
                                this.addInteraction(null, {"event":assertTrue>0?"assertAttributeTrue":"assertAttributeFalse","id":this.assertHighlight.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            else if (this.assertHighlight.nodeName.toLowerCase() == "svg"){
                                if (this.assertHighlight.parentNode.className.indexOf("IconWrapper") > -1 || this.assertHighlight.parentNode.className === "iot--value-card__attribute-threshold-icon-container"){
                                    var divNode = this.assertHighlight.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
                                    this.addInteraction(null, {"event":assertTrue>0?"assertCardThresholdIconTrue":"assertCardThresholdIconFalse","id":divNode.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                                }
                                else if (this.assertHighlight.parentNode.className.indexOf("iot--gauge-container") > -1){
                                    var divNode = this.assertHighlight.parentNode.parentNode.parentNode;
                                    this.addInteraction(null, {"event":assertTrue>0?"assertCardThresholdIconTrue":"assertCardThresholdIconFalse","id":divNode.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                                }
                                else    
                                    this.addInteraction(null, {"event":assertTrue>0?"assertAttributeTrue":"assertAttributeFalse","id":this.assertHighlight.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.id === "" && this.assertHighlight.parentNode.className === "bx--table-header-label"){
                                var parentNode = this.assertHighlight.parentNode.parentNode;
                                var parentID = parentNode.id;
                                this.addInteraction(null, {"event":assertTrue>0?"assertLabelTrue":"assertLabelFalse","id":parentID,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue}); 
                            }
                            else if (!hasClassProp && this.assertHighlight.tagName.toLowerCase() === "h2"){
                                var parentNode = this.assertHighlight.parentNode;
                                this.addInteraction(null, {"event":assertTrue>0?"assertHeaderTrue":"assertLabelFalse","className":parentNode.className,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue}); 
                            }
                            else if (hasClassProp && (this.assertHighlight.className === ("bx--form__helper-text") || this.assertHighlight.className === "bx--label")) {                    
                                var siblingNode = this.assertHighlight.nextSibling;
                                var siblingChild = siblingNode.firstChild;
                                var siblingID = siblingChild.id;
                                if (siblingID === "")
                                    siblingID = siblingNode.childNodes[1].id;
                                this.addInteraction(null, {"event":assertTrue>0?"assertLabelTrue":"assertLabelFalse","id":siblingID,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});  
                            }
                            else if (this.assertHighlight.nodeName == "P" && assertionAttribute === "style" && this.assertHighlight.parentNode.nodeName === "DIV") {
                                this.addInteraction(null, {"event":assertTrue>0?"assertContainerStyleTrue":"assertContainerStyleFalse","id":this.assertHighlight.id,"comment":commentValue, "attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.className.indexOf("bx--form-item bx--text-input-wrapper") > -1){
                                var parentNode = this.assertHighlight.parentNode;
                                var parentID = parentNode.id;
                                this.addInteraction(null, {"event":assertTrue>0?"assertLabelTrue":"assertLabelFalse","id":parentID,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.className.indexOf("bx--tabs__nav-item") > -1) {
                                this.addInteraction(null, {"event":assertTrue>0?"assertLabelTrue":"assertLabelFalse","id":this.assertHighlight.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && (this.assertHighlight.className.indexOf("bx--list-box__label") > -1 || this.assertHighlight.className.indexOf("bx--dropdown") > -1)) {
                                var dropdownNode;
                                if (this.assertHighlight.className.indexOf("bx--list-box__label") > -1)
                                    dropdownNode = this.assertHighlight.parentNode.parentNode;
                                else
                                    dropdownNode = this.assertHighlight;
                                var parentNode = dropdownNode;
                                if (parentNode.id === '')
                                    parentNode = dropdownNode.parentNode.parentNode.parentNode.parentNode;
                                this.addInteraction(null, {"event":assertTrue>0?"assertDropdownValueTrue":"assertDropdownValueFalse","id":parentNode.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.className === "bx--accordion__title"){
                                var parentNode = this.assertHighlight.parentNode.parentNode.parentNode.parentNode;
                                var parentID = parentNode.id;
                                this.addInteraction(null, {"event":assertTrue>0?"assertLabelTrue":"assertLabelFalse","id":parentID,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.id === "" && this.assertHighlight.className.indexOf("TableBodyRow__StyledNestedSpan") > -1){
                                var parentNode = this.assertHighlight.parentNode;
                                var parentID = parentNode.id;
                                this.addInteraction(null, {"event":assertTrue>0?"assertLabelTrue":"assertLabelFalse","id":parentID,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});                               
                            }
                            else if (hasClassProp && this.assertHighlight.className.indexOf("iot--progress-text") > -1 && this.assertHighlight.tagName.toLowerCase() === "p"){
                                var buttonNode = this.assertHighlight.parentNode.parentNode;
                                var buttonID = buttonNode.getAttribute("data-testid");
                                var cname = this.assertHighlight.className;
                                this.addInteraction(null, {"event":assertTrue>0?"assertLabelTrue":"assertLabelFalse","buttonID":buttonID,"className":cname,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.className.indexOf("iot--progress-step") > -1 && this.assertHighlight.tagName.toLowerCase() === "button"){
                                var buttonID = this.assertHighlight.getAttribute("data-testid");
                                this.addInteraction(null, {"event":assertTrue>0?"assertLabelTrue":"assertLabelFalse","buttonID":buttonID,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (this.assertHighlight.className === "text-switch bx--content-switcher_btn")
                                this.addInteraction(null, {"event":assertTrue>0?"assertLabelTrue":"assertLabelFalse","id":this.assertHighlight.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            else if (this.assertHighlight.className.indexOf("bx--list-box__selection") > -1){
                                var parentNode = this.assertHighlight.parentNode.parentNode;
                                if (parentNode.id === '')
                                    parentNode = this.assertHighlight.parentNode.parentNode.parentNode.parentNode.parentNode;
                                this.addInteraction(null, {"event":assertTrue>0?"assertDropdownSelectionValueTrue":"assertDropdownSelectionValueFalse","id":parentNode.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (this.assertHighlight.className === "bx--checkbox-label-text")
                                this.addInteraction(null, {"event":assertTrue>0?"assertLabelTrue":"assertLabelFalse","id":this.assertHighlight.parentNode.previousSibling.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            else if (this.assertHighlight.className === "bx--modal-header__heading")
                                this.addInteraction(null, {"event":assertTrue>0?"assertDialogHeaderTrue":"assertDialogHeaderFalse","id":this.assertHighlight.parentNode.parentNode.parentNode.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            else if (this.assertHighlight.className.startsWith("bx--btn bx--btn--") && this.assertHighlight.id === "" && this.assertHighlight.getAttribute("icon") === null)
                                this.addInteraction(null, {"event":assertTrue>0?"assertDialogButtonTrue":"assertDialogButtonFalse","id":this.assertHighlight.parentNode.parentNode.parentNode.id,"className":this.assertHighlight.className,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            else if (this.assertHighlight.className === "bx--pagination__text"){
                                var footerSide = this.assertHighlight.parentNode.className;
                                footerSide = footerSide.substring(16);
                                var tableClass = this.assertHighlight.parentNode.parentNode.parentNode.className;
                                tableClass = tableClass.split(" ");
                                tableClass = tableClass[0];
                                var elemTag = this.assertHighlight.tagName.toLowerCase();
                                this.addInteraction(null, {"event":assertTrue>0?"assertTableFooterValueTrue":"assertTableFooterValueFalse","tableClass":tableClass,"footerSide":footerSide,"elemTag":elemTag,"elemClass":"bx--pagination__text","comment":commentValue,"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.className === "bx--select-input"){
                                var footerSide = this.assertHighlight.parentNode.parentNode.parentNode.parentNode.parentNode.className;
                                footerSide = footerSide.substring(16);
                                var tableClass = this.assertHighlight.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.className;
                                tableClass = tableClass.split(" ");
                                tableClass = tableClass[0];
                                var elemTag = this.assertHighlight.tagName.toLowerCase();
                                this.addInteraction(null, {"event":assertTrue>0?"assertTableFooterValueTrue":"assertTableFooterValueFalse","tableClass":tableClass,"footerSide":footerSide,"elemTag":elemTag,"elemClass":"bx--select-input","comment":commentValue,"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.className === "mx--no-data-text"){
                                var id = this.assertHighlight.parentNode.parentNode.parentNode.parentNode.id;
                                if (id === '')
                                    id = this.assertHighlight.parentNode.parentNode.parentNode.parentNode.parentNode.id;
                                this.addInteraction(null, {"event":assertTrue>0?"assertNoResultsMessageTrue":"assertNoResultsMessageFalse","id":id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (!hasClassProp && this.assertHighlight.nodeName.toLowerCase() === "p" && this.assertHighlight.parentNode.className === "empty-table-cell--default"){
                                var tableClass = this.assertHighlight.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.className;
                                tableClass = tableClass.split(" ");
                                tableClass = tableClass[0];
                                this.addInteraction(null, {"event":assertTrue>0?"assertNoResultsMessageTrue":"assertNoResultsMessageFalse","tableClass":tableClass,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.className === "iot--empty-state--title"){
                                var id = this.assertHighlight.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id;
                                this.addInteraction(null, {"event":assertTrue>0?"assertNoResultsMessageTrue":"assertNoResultsMessageFalse","id":id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.className === "bx--tooltip__label title--text"){
                                var divClass = this.assertHighlight.parentNode.parentNode.parentNode.className;
                                divClass = divClass.split(" ");
                                divClass = divClass[0];
                                this.addInteraction(null, {"event":assertTrue>0?"assertCardTitleTrue":"assertCardTitleFalse","divClass":divClass,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.className.indexOf("card--title--text") > -1){
                                var divNode = this.assertHighlight.parentNode.parentNode.parentNode;
                                if (divNode.id !== "")
                                    this.addInteraction(null, {"event":assertTrue>0?"assertCardTitleTrue":"assertCardTitleFalse","id":divNode.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                                else{
                                    var nodeClass = divNode.className;
                                    nodeClass = nodeClass.split(" ");
                                    nodeClass = nodeClass[0];
                                    this.addInteraction(null, {"event":assertTrue>0?"assertCardTitleTrue":"assertCardTitleFalse","divClass":nodeClass,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                                }                                  
                            }
                            else if (hasClassProp && (this.assertHighlight.className === "iot--value-card__value-renderer--value" || this.assertHighlight.className === "iot--value-card__attribute-unit" || this.assertHighlight.className === "iot--value-card__attribute" || this.assertHighlight.className === "iot--value-card__attribute-label") && this.assertHighlight.parentNode.tagName.toLowerCase() === "div"){
                                var divClass = this.assertHighlight.className;
                                var divID = this.assertHighlight.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id;
                                if (divID === '')
                                    divID = this.assertHighlight.parentNode.parentNode.parentNode.parentNode.parentNode.id;
                                if (divID === '')
                                    divID = this.assertHighlight.parentNode.parentNode.parentNode.parentNode.id;
                                var useClass = false;
                                if (divID === ''){
                                    divID = this.assertHighlight.parentNode.className;
                                    useClass = true;
                                }
                                if (!useClass)
                                    this.addInteraction(null, {"event":assertTrue>0?"assertCardValueTrue":"assertCardValueFalse","id":divID,"divClass":divClass,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                                else
                                   this.addInteraction(null, {"event":assertTrue>0?"assertCardValueTrue":"assertCardValueFalse","parentDiv":divID,"divClass":divClass,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue}); 
                            }
                            else if (hasClassProp && this.assertHighlight.className.indexOf("ValueCard__AttributeLabel") > -1){
                                var divClass = this.assertHighlight.className;
                                var divID = this.assertHighlight.parentNode.parentNode.parentNode.parentNode.id;
                                this.addInteraction(null, {"event":assertTrue>0?"assertCardValueTrue":"assertCardValueFalse","id":divID,"divClass":spanClass,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (!hasClassProp && this.assertHighlight.nodeName.toLowerCase() === "span" && this.assertHighlight.parentNode.className === "bx--table-header-label"){
                                var parentNode = this.assertHighlight.parentNode.parentNode;
                                this.addInteraction(null, {"event":assertTrue>0?"assertColumnLabelTrue":"assertColumnLabelFalse","id":parentNode.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.className == "iot--table-toolbar-secondary-title"){
                                var tableClass = this.assertHighlight.parentNode.parentNode.className;
                                tableClass = tableClass.split(" ");
                                tableClass = tableClass[0];
                                this.addInteraction(null, {"event":assertTrue>0?"assertLabelTrue":"assertLabelFalse","divClass":tableClass,"labelClass":"iot--table-toolbar-secondary-title","comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.className === "bx--side-nav__item")
                                this.addInteraction(null, {"event":assertTrue>0?"assertSideNavigationItemTrue":"assertSideNavigationItemFalse","comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            else if (!hasClassProp && this.assertHighlight.parentNode.className === "bx--radio-button__label"){
                                var inputNode = this.assertHighlight.parentNode.previousSibling;
                                this.addInteraction(null, {"event":assertTrue>0?"assertLabelTrue":"assertLabelFalse","id":inputNode.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.className.indexOf("bx--toggle__text") > -1){
                                var inputNode = this.assertHighlight.parentNode.parentNode.previousSibling;
                                this.addInteraction(null, {"event":assertTrue>0?"assertToggleTextTrue":"assertToggleTextFalse","id":inputNode.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.className.indexOf("bx--form-requirement") > -1 && this.assertHighlight.parentNode.className.indexOf("bx--dropdown") > -1){
                                var parentNode = this.assertHighlight.parentNode;
                                this.addInteraction(null,{"event":assertTrue>0?"assertDropdownWarningTextTrue":"assertDropdownWarningTextFalse","id":parentNode.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && (this.assertHighlight.className.indexOf("iot--gauge-trend") > -1 || this.assertHighlight.className.indexOf("iot--data-state-container") > -1)){
                                var parentDiv = this.assertHighlight.parentNode.parentNode.parentNode;
                                this.addInteraction(null,{"event":assertTrue>0?"assertCardGaugeTrendTrue":"assertCardGaugeTrendFalse","id":parentDiv.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.className.indexOf("column-header__btn iot--column-header") > -1){
                                var parentDiv = this.assertHighlight.parentNode;
                                this.addInteraction(null,{"event":assertTrue>0?"assertTableHeaderColumnButtonLabelTrue":"assertTableHeaderColumnButtonLabelFalse","divClass":parentDiv.className,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.className === "bx--header__name"){
                                this.addInteraction(null,{"event":assertTrue>0?"assertNavbarTrue":"assertNavbarFalse","comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && (this.assertHighlight.className === "mx--dialog-content-body" || this.assertHighlight.className === "mx--dialog-bmx")){ 
                                this.addInteraction(null,{"event":assertTrue>0?"assertSystemMessageTrue":"assertSystemMessageFalse","comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.tagName.toLowerCase() === "button" && this.assertHighlight.className.indexOf("bx--btn bx--btn--primary") > -1 && this.assertHighlight.parentNode.className === "bx--action-list" && (this.assertHighlight.getAttribute("icon") !== null || this.assertHighlight.className === "bx--batch-summary__cancel bx--btn bx--btn--primary")){
                                var divClass = this.assertHighlight.parentNode.parentNode.parentNode.parentNode.className;
                                divClass = divClass.split(" ");
                                divClass = divClass[0];
                                this.addInteraction(null,{"event":assertTrue>0?"assertTableActionButtonTrue":"assertTableActionButtonFalse","divClass":divClass,"buttonName":this.assertHighlight.textContent,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.tagName.toLowerCase() === "p" && this.assertHighlight.className === "bx--batch-summary__para"){
                                var divClass = this.assertHighlight.parentNode.parentNode.parentNode.parentNode.className;
                                divClass = divClass.split(" ");
                                divClass = divClass[0];
                                this.addInteraction(null,{"event":assertTrue>0?"assertTableActionCountTrue":"assertTableActionCountFalse","divClass":divClass,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            }
                            else if (hasClassProp && this.assertHighlight.id === "" && this.assertHighlight.className.startsWith("mx--WrappedText"))
                                this.addInteraction(null,{"event":assertTrue>0?"assertWrappedTextTrue":"assertWrappedTextFalse","id":this.assertHighlight.parentNode.parentNode.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            else if (!hasClassProp && this.assertHighlight.tagName.toLowerCase() == "label" && this.assertHighlight.parentNode.tagName.toLowerCase() === "fieldset" && this.assertHighlight.parentNode.className === "mx--radio-buttons-fieldset")
                                this.addInteraction(null, {"event":assertTrue>0?"assertLabelTrue":"assertLabelFalse","id":this.assertHighlight.parentNode.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            else if (hasClassProp && this.assertHighlight.tagName.toLowerCase() === "label" && this.assertHighlight.className === "bx--radio-button__label")
                                this.addInteraction(null, {"event":assertTrue>0?"assertLabelTrue":"assertLabelFalse","id":this.assertHighlight.parentNode.childNodes[0].id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
                            else
                                this.addInteraction(null, {"event":assertTrue>0?"assertAttributeTrue":"assertAttributeFalse","id":this.assertHighlight.id,"comment":commentValue,
									"attribute":assertionAttribute, "value":assertionValue});
 						}
						dom.byId("insp_assertionText").value="";
						dom.byId("insp_assertionComment").value="";
						var message = this.resources.strings.assertion_add_success;
						this.showNotification(message +" "+ (parseInt(this.currentInteraction)+1), 0);
 					}
				}
			}
		}
		catch(error){
			this.showNotification(this.resources.strings.assertion_add_fail, 2);			
		}
	},
	createAssertion: function(){
		var rec = inspectorData.recording;
		var insp = this;
		assertionDialog = new insp.InspectorDialog({
	    	id: "insp_assertionDialog",
	        title: "Assertion Builder"+	'<table style="position: absolute; margin: 0px 5px; display:inline; cursor: default;"><tr><td style="vertical-align:top"><img style="margin: 0px" width="18" height="18" onmouseover="var ht= dojo.byId(\'helpText\'); ht.style.display=\'\';" onmouseout="var ht= dojo.byId(\'helpText\'); ht.style.display=\'none\';" alt="" src="'+insp.resources.images.help+'"/></td><td id="helpText" style="display:none; background: #fff; border: 1px solid #000 ;margin: 0px 5px; box-shadow: 2px 2px 2px #999; ">'+insp.resources.strings.assertion_builder_help+'</td></tr></table><br>',
	        content: '<div class="insp_d_content">'+
	        '<div class="notification" id="insp_assertion_info" style="text-align: center;height: 20px;">&nbsp;</div>'+
	        '<label for="insp_assertionText"><span style="color:orange">* </span>'+insp.resources.strings.assertion+'</label><br>'+
	        '<input type="text"  id="insp_assertionText" name="insp_assertionText" style="width: 380px"/>'+
	        '<button id="insp_assertAddButton" data-method="addAssertion" style="vertical-align:middle; margin: 5px; padding: 3px" ><img style="margin: 0px" width="18" height="18" title="" alt="" src="'+insp.resources.images.add+'" /></button><br><br>'+
	        '<label for="insp_assertionComment">'+insp.resources.strings.comment+'</label><br>'+
	        '<input type="text" id="insp_assertionComment" style="width: 380px" />'+
	        '<div id="insp_assertionBuilder">'+
	        '	<br><label>'+insp.resources.strings.assert_label+'</label>'+
	        '	<div class="dataList" >'+
	        '		<table border="1">'+
	        '			<tbody id="insp_assertionAttributes"></tbody>'+
	        '		</table>'+
	        '	</div>'+
	        '</div></div>'+
	        '<div data-dojo-type="dijit/Toolbar" class="inspectorToolbar" style="text-align:'+reverseAlign+'">'+
	        '	<button id="insp_assertDoneButton" data-method="cancel" >'+insp.resources.strings.done+'</button>&nbsp;'+
	        '</div>',
	        onHide: function(){
	        	var dialog = registry.byId("insp_assertionDialog");
	        	var inspDialog = registry.byId("insp_inspectorDialog");
	        	style.set(inspDialog.domNode, {"display":"","left":inspectorData.dialogPosition.x+"px", "top":inspectorData.dialogPosition.y+"px"});
				insp.removeHighlights();
				dialog.destroyRecursive(false);
	        	inspectorData.recording = rec;
	        	assertionDialog.clickHandler.remove();
				assertionDialog.destroyRecursive();
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
		insp.processSimpleDialogButtons(assertionDialog);
		style.set(assertionDialog.containerNode, {"padding":"0px"});
		assertionDialog.show();
		var underlay = dom.byId("insp_assertionDialog_underlay");
		style.set(underlay, {"background":"transparent"});
		onEvent(underlay, "mousemove", function(e){
			insp.removeHighlights();
			style.set(this, {"display":"none"});
            var node = document.elementFromPoint(e.clientX, e.clientY);
			style.set(this, {"display":""});
			if(node.id){
				array.some(insp.getUseAttributes(node).sort(), function(attribute){
					if(insp.isAssertionNode(node, attr.get(node, attribute))){ //attribute!="innerHTML" || node.tagName=="BUTTON"){// || /<[a-z][\s\S]*>/i.test(attrValue)!==true){
						insp.highlightHover = node;
						insp.addHighlight(node, "2px solid blue");
						return true;
					}
				});
			}
		});
		assertionDialog.clickHandler = onEvent(underlay, "mousedown", function(e){
    		style.set(this, {"display":"none"});
  			var chosenElement = document.elementFromPoint(e.clientX, e.clientY);
            var hasClassProp = false;
            var hascls = chosenElement.className.length;
            if (hascls > 0)
                hasClassProp = true;
			if (chosenElement.id && chosenElement.id === "techWODetail_ld_frame"){
				chosenElement = document.getElementById("techWODetail_ld_frame").contentWindow.document.getElementById("technicianmain_techWODetail_ld_inernalDiv");
			}
			else if (chosenElement.id === "" && chosenElement.tagName === "DIV" && (chosenElement.outerHTML.indexOf("maximo-checkbox") > -1)){
				chosenElement = chosenElement.parentNode;
				chosenElement = chosenElement.parentNode;
			}
			else if ((chosenElement.id.indexOf("workscape-") > -1 && chosenElement.id.indexOf("_checkbox") > -1 && chosenElement.tagName === "DIV") || (chosenElement.id.match("^checkbox") && chosenElement.tagName === "DIV" && (chosenElement.outerHTML.indexOf("maximo-checkbox") > -1))){
				chosenElement = chosenElement.parentNode;
			}
            else if (chosenElement.id === "" && chosenElement.className === "" && chosenElement.nodeName === "DIV" && chosenElement.parentNode.parentNode.nodeName === "BUTTON")
                chosenElement = chosenElement.parentNode.parentNode;
            else if (chosenElement.id === "" && chosenElement.className === "" && chosenElement.nodeName === "DIV" && chosenElement.childNodes[0] && chosenElement.childNodes[0].nodeName === "P")
                chosenElement = chosenElement.childNodes[0];
            else if (chosenElement.id === "" && (chosenElement.className === "bx--list-box_field" || chosenElement.className === "bx--list-box__field"))
                chosenElement = chosenElement.firstChild;
            else if (chosenElement.id === "" && chosenElement.className === "bx--list-box__label")
                chosenElement = chosenElement.parentNode.parentNode;
            else if (chosenElement.id === "" && chosenElement.className === "bx--tabs__nav-link")
                chosenElement = chosenElement.parentNode;
            else if (chosenElement.id === "" && chosenElement.className === "mx--toggle bx--form-item")
                chosenElement = chosenElement.firstChild;
            else if (chosenElement.id === "" && chosenElement.className === "bx--inline-loading__text")
                chosenElement = chosenElement.parentNode.parentNode.parentNode;
            else if (chosenElement.id === "" && chosenElement.tagName.toLowerCase() === "path"){
                chosenElement = chosenElement.parentNode;
                if (chosenElement.tagName.toLowerCase() === "svg" && chosenElement.parentNode.className === "bx--tooltip__label")
                    chosenElement = chosenElement.parentNode;
                else if (chosenElement.tagName.toLowerCase() === "text" && chosenElement.parentNode.className === "iot--progress-step-icon")
                    chosenElement = chosenElement.parentNode.parentNode;
                else if (chosenElement.tagName.toLowerCase() === "svg" && chosenElement.parentNode.className === "mx--tag-action-icon")
                    chosenElement = chosenElement.parentNode;
            }
            if (chosenElement.tagName.toLowerCase() === "text" && chosenElement.parentNode.parentNode.className === "iot--progress-step-icon")
                chosenElement = chosenElement.parentNode.parentNode.parentNode;
            else if (chosenElement.id === "" && chosenElement.className === "bx--content-switcher__label")
                chosenElement = chosenElement.parentNode;
            else if (chosenElement.id === "" && chosenElement.className.indexOf("bx--checkbox-label") > -1 && chosenElement.previousSibling != null)
                chosenElement = chosenElement.previousSibling;
            else if (chosenElement.id === "" && chosenElement.className === "bx--tooltip__label iot--card--title--text")
                chosenElement = chosenElement.parentNode;
            else if (chosenElement.className === "card--title")
                chosenElement = chosenElement.parentNode.parentNode;
            else if (chosenElement.tagName.toLowerCase() === "tspan")
                chosenElement = chosenElement.parentNode.parentNode;
            else if (chosenElement.tagName.toLowerCase() === "span" && chosenElement.className.startsWith("sc-") && chosenElement.parentNode.tagName.toLowerCase() === "td" && chosenElement.parentNode.className.startsWith("sc-"))
                chosenElement = chosenElement.parentNode;
            else if (hasClassProp && chosenElement.className === "bx--link")
                chosenElement = chosenElement.parentNode;
            else if (hasClassProp && chosenElement.className === "mx--product-name")
                chosenElement = chosenElement.parentNode;
            else if (chosenElement.tagName.toLowerCase() === "span" && chosenElement.parentNode.className.indexOf("bx--tag") > -1 && chosenElement.parentElement.className.indexOf("mx--tag--action") > -1)
                chosenElement = chosenElement.parentNode;
            else if (chosenElement.tagName.toLowerCase() === "p" && (chosenElement.parentNode.className.indexOf("iot--gauge-trend") > -1 || chosenElement.parentNode.className.indexOf("iot--data-state-container") > -1))
                chosenElement = chosenElement.parentNode;
            else if (chosenElement.tagName.toLowerCase() === "span" && chosenElement.id === "" && chosenElement.className.startsWith("sc-") && chosenElement.parentNode.tagName.toLowerCase() === "td" && chosenElement.parentNode.className.startsWith("data-table-start"))
                chosenElement = chosenElement.parentNode;
            else if (chosenElement.tagName.toLowerCase() === "p" && chosenElement.id === "" && chosenElement.className.startsWith("mx--label mx-body-short") && chosenElement.parentNode.tagName.toLowerCase() === "div" && chosenElement.parentNode.className === "")
                chosenElement = chosenElement.parentNode;
            else if (chosenElement.tagName.toLowerCase() === "span" && !hasClassProp && chosenElement.parentNode.tagName.toLowerCase() === "label" && chosenElement.parentNode.className === "bx--radio-button__label")
                chosenElement = chosenElement.parentNode;
            else if (chosenElement.tagName.toLowerCase() === "label" && !hasClassProp && chosenElement.parentNode.tagName.toLowerCase () === "fieldset" && chosenElement.parentNode.className === "mx--radio-buttons-fieldset")
                chosenElement = chosenElement.parentNode;
            else if (hasClassProp && chosenElement.className.startsWith("mx--chatbox-"))
                chosenElement = chosenElement.parentNode.parentNode;
            else if (hasClassProp && chosenElement.className.indexOf("tooltipTarget overflowLabelContainer") > -1 && chosenElement.childNodes[0].className.startsWith("mx--label"))
                chosenElement = chosenElement.childNodes[0];
            else if (hasClassProp && chosenElement.id == '' && chosenElement.className.indexOf("textOverflow") > -1 && chosenElement.className.startsWith("mx--label mx-body-short-01"))
                chosenElement = chosenElement.parentNode;
            else if (!hasClassProp && chosenElement.tagName.toLowerCase() === "span" && chosenElement.parentNode.tagName.toLowerCase() === "p")
                chosenElement = chosenElement.parentNode;
            else if (hasClassProp && chosenElement.tagName.toLowerCase() === "span" && chosenElement.className === "bx--side-nav__link-text")
                chosenElement = chosenElement.parentNode.parentNode;
            else if (hasClassProp && chosenElement.tagName.toLowerCase() === "span" && chosenElement.className.indexOf("iot--table__cell-text--no-wrap") > -1){
                chosenElement = chosenElement.parentNode.parentNode.parentNode;
                if (chosenElement.className.indexOf("data-table-start") === -1 && chosenElement.className.indexOf("data-table-end") === -1)
                    chosenElement = chosenElement.parentNode.parentNode;
            }
            else if (hasClassProp && chosenElement.tagName.toLowerCase() === "span" && chosenElement.className === "iot--table__cell-text--truncate" && chosenElement.parentNode.tagName.toLowerCase() === "span")
                chosenElement = chosenElement.parentNode.parentNode;
            else if (!hasClassProp && chosenElement.tagName.toLowerCase() === "span" && chosenElement.id === "" && chosenElement.parentNode.tagName.toLowerCase() === "td")
                chosenElement = chosenElement.parentNode;
            else if (!hasClassProp && chosenElement.tagName.toLowerCase() === "div" && chosenElement.id === "" && chosenElement.parentNode.tagName.toLowerCase() === "a" && chosenElement.parentNode.id.indexOf("tab_anchor") > -1)
                chosenElement = chosenElement.parentNode;
            else if (hasClassProp && chosenElement.className !== "" && chosenElement.className != null){
                if (chosenElement.id === "" && chosenElement.className.indexOf("bx--toggle__appearance") > -1)
                    chosenElement = chosenElement.parentNode.previousSibling;
                else if (chosenElement.tagName.toLowerCase() === "span" && chosenElement.className === "bx--radio-button__appearance")
                    chosenElement = chosenElement.parentNode.previousSibling;
                else if (chosenElement.className === "bx--toggle__switch")
                    chosenElement = chosenElement.parentNode.previousSibling;
                else if (hasClassProp && chosenElement.className === "bx--inline-loading hideIcon spinnerEnd")
                    chosenElement = chosenElement.parentNode;
            }
            
			insp.setAssertionElement(chosenElement);
			style.set(underlay, {"display":""});
    		e.cancelBubble = true;
			e.preventDefault();
    	});
		style.set(assertionDialog.domNode, {"left":parseInt(inspectorDialog.domNode.style.left, 10)+"px", "top":
		parseInt(inspectorDialog.domNode.style.top, 10)+"px", "width":parseInt(inspectorDialog.domNode.clientWidth, 10)+"px"});
		style.set(registry.byId("insp_inspectorDialog").domNode, {"display":"none"});
		insp.addClearFields(inspectorDialog.domNode);
	},
	addHighlight: function(node, highlight){
		highlight = {"nodeId":node.id,"highlight":highlight};
		if(typeof highlight.highlight == "string"){
			highlight.highlight = {"outline":highlight.highlight};
		}
		this.highlights.push(highlight);
		Object.keys(highlight.highlight).forEach(function(key) {
			style.set(node, key, highlight.highlight[key]);
		});
	},
	removeHighlights: function(){
		array.forEach(this.highlights, function(highlight){
			if(highlight.nodeId && highlight.highlight){
				var node = dom.byId(highlight.nodeId);
				if (node && node.id.match("^checkbox") && node.tagName === "MAXIMO-CHECKBOX" && (node.outerHTML.indexOf("maximo-checkbox") > -1))
					node = node.parentNode;
				if(node){
					Object.keys(highlight.highlight).forEach(function(key) {
						style.set(node, key, "");
					});
				}
			}
		});
		this.highlights = [];
	},
	assertTextClear: function(){
		dom.byId("insp_assertionText").value="";
	},
	assertCommentClear: function(){
		dom.byId("insp_assertionComment").value="";
	},
	isAssertionNode: function(node, attrValue){
		return /<[a-z][\s\S]*>/i.test(attrValue)!==true || node.tagName == "LABEL";
	},
	setAssertionElement: function(node){
        var useXpath = false;
        var addlAttributes = false;
        var hasClassProp = false;
            var hascls = node.className.length;
            if (hascls > 0)
                hasClassProp = true;
        if (hasClassProp && node.nodeName.toLowerCase() != "svg" && node.nodeName.toLowerCase() !== "iframe") {
            if (node.className === "bx--form__helper-text" || node.className.indexOf("bx--toggle__text") > -1 || node.className.indexOf("bx--tabs__nav-link") > -1 || node.className.indexOf("bx--form-item bx--text-input-wrapper") > -1 || node.className.indexOf("mx--toggle bx--form-item") > -1 || node.className.indexOf("bx--list-box__label") > -1 || node.className.indexOf("bx--list-box__field") > -1 || node.className.indexOf("bx--label") > -1 || node.className.indexOf("mx-label-theme-header") > -1 || node.className.indexOf("bx--accordion__title") > -1 || node.parentNode.className === "bx--table-header-label" || node.className === "bx--toggle-input__label" || node.className.indexOf("TableBodyRow__StyledNestedSpan") > -1 || node.className.indexOf("bx--list-box__selection") > -1 || node.className === "bx--checkbox-label-text" || node.className.indexOf("bx--modal-header__heading") > -1 || node.className.indexOf("bx--btn bx--btn--") > -1 || node.className.indexOf("bx--pagination__text") > -1 || node.className.indexOf("table-toolbar-secondary-title") > -1 || node.className === "mx--no-data-text" || node.nodeName.toLowerCase() === "p" || node.className.indexOf("ValueRenderer__AttributeValue") > -1 || node.className.indexOf("ValueCard__AttributeLabel") > -1 || node.parentNode.className.indexOf("IconWrapper") > -1 || node.className === "title--text" || node.className === "bx--toggle__switch" || node.className.indexOf("bx--form-requirement") > -1 || node.className === "iot--card--title--text" || node.className.indexOf("iot--gauge-trend") > -1 || node.className.indexOf("iot--data-state-container") > -1 || (node.className.indexOf("iot--value-card__") > -1 && node.tagName.toLowerCase != "span") || (node.tagName.toLowerCase() === "label" && node.parentNode.className === "mx--radio-buttons-fieldset") || node.className.startsWith("mx--BorderLayout") || node.className === "mx--dialog-content-body" || node.className.startsWith("mx--WrappedText") || node.className === "bx--list-box__field" || node.className === "mx--company-name" || node.className === "mx--product-name-adaptive" || node.className === "mx--product-name" || node.className === "mx--application-name" || node.className === "bx--header__name" || node.className === "mx--dialog-bmx" || node.className === "bx--side-nav__item" || node.className === "iot--empty-state--title" || node.className.indexOf("iot--progress-step-button") > -1) 
                useXpath = true;
            else if (hasClassProp && node.parentNode.parentNode.parentNode && (node.nodeName === "H1") && node.parentNode.parentNode.parentNode.className.indexOf("Application containsNavbar") > -1)
                useXpath = true;
            else if (node.className === "bx--radio-button__label")
                useXpath = true;
        }
        else if (node.tagName.toLowerCase() === "h2")
            useXpath = true;
        
        if (node.nodeName == "P" && node.parentNode.nodeName == "DIV")
            addlAttributes = true;
        else if (node.nodeName.toLowerCase() === "svg" && !node.id.endsWith("tooltipIcon") && node.parentNode.className !== "iot--value-card__attribute-threshold-icon-container"){
            useXpath = true;
            addlAttributes = true;
        }
        else if (node.nodeName.toLowerCase() === "a")
            useXpath = true;
        else if (node.nodeName.toLowerCase() === "svg" && node.parentNode.className === "iot--value-card__attribute-threshold-icon-container")
            useXpath = true;
        else if (node.nodeName.toLowerCase() === "iframe")
            addlAttributes = true;
        else if (node.nodeName.toLowerCase() === "span" && node.className === "bx--list-box__label")
            addlAttributes = true;        
        else if (node.nodeName.toLowerCase() === "div" && node.className.indexOf("Card__CardWrapper") > -1)
            addlAttributes = true;
        else if (node.nodeName.toLowerCase() === "input" && node.className === "bx--checkbox" && node.parentNode.parentNode.parentNode.className.toLowerCase() === "th")
            addlAttributes = true;
        else if (node.nodeName.toLowerCase() === "input" && node.className === "bx--radio-button")
            addlAttributes = true;
        else if (node.nodeName.toLowerCase() === "input" && node.className === "bx--toggle-input")
            addlAttributes = true;
        else if (node.nodeName.toLowerCase() === "label" && node.className === "bx--label" && node.parentNode.parentNode.parentNode.parentNode.tagName.toLowerCase() === "div" && node.parentNode.parentNode.parentNode.parentNode.className === "mx--text-required")
            addlAttributes = true;
        else if (node.className === "bx--header__name")
            addlAttributes = true;
        else if (node.nodeName.toLowerCase() === "button" && node.className.indexOf("bx--content-switcher-btn") > -1)
            addlAttributes = true;
        else if (hasClassProp && node.className.indexOf("iot--progress-step-button") > -1)
            addlAttributes = true;
        else if (node.nodeName.toLowerCase() === "p" && node.className === "mx--label" && this.assertHighlight.parentNode.className === "mx--text-required")
            addlAttributes = true;
        else if (node.nodeName.toLowerCase() === "fieldset" && node.className === "mx--radio-buttons-fieldset")
            addlAttributes = true;
        else if (node.tagName.toLowerCase() === "span" && node.className.indexOf("bx--toggle__text") >-1)
            addlAttributes = true;
        else if (node.tagName.toLowerCase() === "div" && node.className.indexOf("maximo-toggle-button") > -1)
            addlAttributes = true;
        else if (node.tagName.toLowerCase() === "input" && node.id === "nav_search_field")
            addlAttributes = true;
        else if (node.tagName.toLowerCase() === "input" && node.getAttribute("type") === "radio")
            addlAttributes = true;
         
		if(!node.id && !useXpath){
			this.missingId(null, node);
			this.showNotification(this.resources.strings.missing_id, 1);
			return;
		}
		if(this.assertHighlight){
			this.removeHighlights();
			onEvent.emit(this.assertHighlight, "mouseout", {
				cancelable: false,
				bubbles: true
			});
			this.assertHighlight = null;
		}
		var attributeList = dom.byId("insp_assertionAttributes");
		if(attributeList){
			attributeList.innerHTML = "";
		}
		var attributeKeys = [];
		array.forEach(node.attributes, function(attribute, index){
			attributeKeys.push(attribute.name+":"+index);
		});
		var insp = this;
		array.forEach(insp.getUseAttributes(node).sort(), function(attribute){
            var attrValue = (attr.get(node, attribute));
            var isassert = insp.isAssertionNode(node, attrValue);
            if(insp.isAssertionNode(node, attrValue) && attrValue && !(node.className === "bx--toggle" && attribute === "value") && !(node.className === "bx--checkbox" && attribute === "value") && !(node.tagName === "input" && node.getAttribute("type") === "radio")){  
                insp.addAttributeToList(attributeList, {"name":attribute,"value":attrValue}, true);				
            }
            else if (node.className === "bx--toggle" && attribute === "checked" && attrValue === false)
                insp.addAttributeToList(attributeList, {"name":"checked","value":"false"}, true);
            else if (node.className === "bx--checkbox" && attribute === "checked" && node.nodeName.toLowerCase() === "input" && attrValue === false)
                insp.addAttributeToList(attributeList, {"name":"checked","value":"false"}, true);
		});
        if (addlAttributes){
            if (node.nodeName.toLowerCase() !== "svg" && node.nodeName.toLowerCase() !== "iframe" && node.className !== "bx--checkbox" && node.className !== "bx--radio-button" && node.className !== "bx--toggle-input" && node.className !== "bx--label" && node.className.indexOf("iot--progress-step-button") == -1 && node.className.indexOf("mx--label field-label") == -1 && !(node.nodeName.toLowerCase() === "p" && node.className.indexOf("mx--label") > -1) && node.className.indexOf("bx--list-box__label") == -1 && node.className !== "mx--radio-buttons-fieldset" && node.className.indexOf("bx--toggle__text") == -1 && node.className.indexOf("maximo-toggle-button") == -1 &&
            node.id !== "nav_search_field" && !(node.tagName.toLowerCase() === "input" && node.getAttribute("type") === "radio")) {
                var newNode = node.parentNode;
                var attrValue = attr.get(newNode,"style");
                insp.addAttributeToList(attributeList, {"name":"style","value":attrValue}, true);
                if (node.nodeName.toLowerCase() === "div" && node.className.indexOf("Card__CardWrapper") > -1){
                    var newNode = node.childNodes[0].childNodes[0];
                    var attrValue = attr.get(newNode,"title");
                    insp.addAttributeToList(attributeList,{"name":"title","value":attrValue}, true);
                }
            }
            else if (node.nodeName.toLowerCase() === "input" && node.className === "bx--checkbox" && node.parentNode.parentNode.parentNode.className.toLowerCase() === "th"){
                var newNode = node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
                var checked = false;
                if (newNode.childNodes[2].className === "mx--row")
                    checked = true;
                insp.addAttributeToList(attributeList,{"name":"checked","value":checked}, true);
            }
            else if (node.className === "bx--list-box__label"){
                var parentNode = node.parentNode;
                insp.addAttributeToList(attributeList,{"name":"className","value":parentNode.className}, true);
            }
            else if (node.nodeName.toLowerCase() === "input" && node.className === "bx--toggle-input"){
                if (attributeList.innerText.indexOf("checked") === -1)
                    insp.addAttributeToList(attributeList, {"name":"checked","value":"false"}, true);
            }
            else if (node.nodeName.toLowerCase() === "iframe"){
                var istinymce = true;
                var newNode = document.getElementById(node.id).contentWindow.document.getElementById("tinymce");
                if (newNode === null){
                    newNode = document.getElementById(node.id).contentWindow.document.getElementById("dijitEditorBody");
                    istinymce = false;
                }
                var attrValue = attr.get(newNode,"textContent");
                var attrValue2 = attr.get(newNode,"innerHTML");
                if (istinymce)
                    var attrValue3 = attr.get(newNode.childNodes[0].childNodes[0],"style");
                insp.addAttributeToList(attributeList,{"name":"textContent","value":attrValue}, true);
                insp.addAttributeToList(attributeList,{"name":"innerHTML","value":attrValue2}, true);
                insp.addAttributeToList(attributeList,{"name":"style","value":attrValue3}, true);
            }
            else if (node.nodeName.toLowerCase() === "input" && node.className === "bx--radio-button"){
                var checked = false;
                var checkedProp = node.checked;
                if (checkedProp !== null && checkedProp != "")
                    checked = true;
                if (checked === false)
                    insp.addAttributeToList(attributeList, {"name":"checked","value":"false"}, true);
            }
            else if (node.nodeName.toLowerCase() === "label" && node.className === "bx--label" && node.parentNode.parentNode.parentNode.parentNode.tagName.toLowerCase() === "div" && node.parentNode.parentNode.parentNode.parentNode.className === "mx--text-required"){
                insp.addAttributeToList(attributeList, {"name":"required","value":"true"}, true);
            }
            else if (node.nodeName.toLowerCase() === "p" && node.className.indexOf("mx--label field-label") > -1 && node.parentNode.parentNode.parentNode.tagName.toLowerCase() === "div" && (node.parentNode.parentNode.parentNode.className === "mx--text-required" || node.parentNode.parentNode.parentNode.parentNode.parentNode.className === "mx--text-required"))
                insp.addAttributeToList(attributeList, {"name":"required","value":"true"}, true);
            else if (node.nodeName.toLowerCase() === "span" && node.className === "bx--list-box__label"){
                var required = "false";
                if (node.parentNode.parentNode.parentNode.parentNode.parentNode.className === "mx--text-required")
                    required = "true";
                insp.addAttributeToList(attributeList, {"name":"required","value":required}, true);
            }
            else if (node.nodeName.toLowerCase() === "p" && node.className.indexOf("mx--label") > -1 && node.parentNode.className === "mx--text-required"){
                var required = false;
                if (node.parentNode.className === "mx--text-required")
                    required = true;
                insp.addAttributeToList(attributeList, {"name":"required","value":required}, true);
            }
            else if (node.nodeName.toLowerCase() === "button" && node.className.indexOf("bx--content-switcher-btn") > -1){
                var attrValue = attr.get(node,"aria-selected")
                insp.addAttributeToList(attributeList, {"name":"aria-selected","value":attrValue}, true);
            }
            else if (node.className === "bx--header__name"){
                var childNode1 = node.childNodes[0];
                var attrValue1 = attr.get(childNode1,"textContent");
                var childNode3 = node.childNodes[3];
                var attrValue3 = attr.get(childNode3,"textContent");
                insp.addAttributeToList(attributeList,{"name":"bx--header__name--prefix","value":attrValue1}, true);
                insp.addAttributeToList(attributeList,{"name":"iot--header__subtitle","value":attrValue3}, true);
            }
            else if (node.className.length > 0 && node.className.indexOf("iot--progress-step-button") > -1){
                var childNode1 = node.childNodes[1];
                var attrValue1 = attr.get(childNode1,"title");
                var childNode2 = node.childNodes[1].childNodes[0].childNodes[2];
                var attrValue2 = attr.get(childNode2,"textContent");
                insp.addAttributeToList(attributeList,{"name":"title","value":attrValue1}, true);
                insp.addAttributeToList(attributeList,{"name":"textContent","value":attrValue2}, true);
            }
            else if (node.nodeName.toLowerCase() === "fieldset" && node.className === "mx--radio-buttons-fieldset"){
                var childNode = node.childNodes[0];
                var attrValue = attr.get(childNode,"innerHTML");
                insp.addAttributeToList(attributeList,{"name":"innerHTML","value":attrValue}, true);
            }
            else if (node.tagName.toLowerCase() === "span" && node.className.indexOf("bx--toggle__text") > -1) {
                var attrValue = attr.get(node,"style");
                insp.addAttributeToList(attributeList,{"name":"style","value":attrValue}, true);
            }
            else if (node.tagName.toLowerCase() === "div" && node.className.indexOf("maximo-toggle-button") > -1){
                insp.addAttributeToList(attributeList,{"name":"aria-checked","value":attr.get(node,"aria-checked")}, true);
                insp.addAttributeToList(attributeList,{"name":"aria-readonly","value":attr.get(node,"aria-readonly")}, true);
            }
            else if (node.tagName.toLowerCase() === "input" && node.id === "nav_search_field")
                insp.addAttributeToList(attributeList,{"name":"placeholder","value":attr.get(node,"placeholder")}, true);
            else if (node.tagName.toLowerCase() === "input" && node.getAttribute("type") === "radio"){
                attributeList.innerHTML = "";
                var isChecked = "false";
                if (attr.get(node,"checked"))
                    isChecked = "true";
                insp.addAttributeToList(attributeList,{"name":"checked","value":isChecked}, true);
            }
            else {
                var newNode = node.parentNode;
                var attrValue = attr.get(newNode,"title");
                insp.addAttributeToList(attributeList, {"name":"title","value":attrValue}, true);
            }
  		};
		insp.addHighlight(node, "2px solid red");
		insp.assertHighlight = node;
	},
	//returns assertion attributes that exist on this node based on type 
	getUseAttributes: function(node){
		var useAttributes = [];
		if(this.assertionAttributes.all){
			useAttributes = lang.clone(this.assertionAttributes.all);
		}
		var tagAttributes = this.assertionAttributes[node.tagName.toLowerCase()];
		if(tagAttributes){
			useAttributes = useAttributes.concat(tagAttributes); 
		}  
        if(node.className === "bx--list-box__label"){
            const index = useAttributes.indexOf("className");
            if (index > -1) {
              useAttributes.splice(index, 1);
            }
        }
		return useAttributes;
	},
	updateAssertionText: function(element){
		var insp = this;
		var value = attr.get(element, "value");
		var match = attr.get(element, "match");
		var attribute = attr.get(element, "attribute");
		var checkValue;
		try {
			checkValue = JSON.parse(value);
			if(typeof checkValue == 'object'){
				value = checkValue;
			}
		}
		catch(error){
			//errors thrown if value is empty
		}
		var aText = dom.byId("insp_assertionText");
		if(typeof value != "object"){
			aText.value = attribute + " " + match + " \"" + value + "\"";
			return;
		}
		//make user choose which internal attribute to use
		jsonAttributeDialog = new insp.InspectorDialog({
	    	id: "insp_jsonAttributeDialog",
	        title: insp.updateParams(insp.resources.strings.choose_attribute, attribute),
	        content: '<div id="insp_jsonAttribute_content" style="width: 200px">'+
	        '	</div>'+
	        '	<div class="inspectorToolbar" style="text-align:'+reverseAlign+'">'+
	        '		<button id="insp_canceljsonAttributeButton" data-method="cancel">'+insp.resources.strings.cancel+'</button>&nbsp;'+
	        '	</div>',
	        onHide: function(){
	        	jsonAttributeDialog.destroyRecursive(false);
	        	Dialog._DialogLevelManager.hide(jsonAttributeDialog);
	        },
	        onShow: function(){
	    		Dialog._DialogLevelManager.show(jsonAttributeDialog);
	        },
	        autofocus: true,
	        refocus: false
	    });
		insp.processSimpleDialogButtons(jsonAttributeDialog);
		{ // complex events
			var content = dom.byId("insp_jsonAttribute_content");
			Object.keys(value).forEach(function(key) {
				var link = document.createElement("A");
				attr.set(link, {"href":"Javascript: void(0);","innerHTML":"fldinfo."+key+" "+match+" \""+value[key]+"\""});
				style.set(link, {"display":"block"});
				onEvent(link, "click", function(){
					aText.value = attribute+"."+key + " " + match + " \"" + value[key] + "\"";
					jsonAttributeDialog.hide();
				});
				content.appendChild(link);
			});
		}
		jsonAttributeDialog.show();
		insp.centerDialogOnParent(jsonAttributeDialog, registry.byId("insp_assertionDialog"));
	},
	addAttributeToList: function(attributeList, attribute, buttons){
		var field = null;
		var insp = this;
		var attrValue = attribute.value?attribute.value:"";
		var col1 = document.createElement("td");
		var equals = document.createElement("button");
		equals.innerHTML="==";
		attr.set(equals, {"value":attrValue,"match":"==","attribute":attribute.name});
		style.set(equals, {"width":"20px", "padding":"0px", "font-size":"9px;"});
		onEvent(equals, "click", function(){
			insp.updateAssertionText(this);
		});
		var notEquals = document.createElement("button");
		notEquals.innerHTML="!=";
		style.set(notEquals, {"width":"20px", "padding":"0px", "font-size":"9px;"});
		attr.set(notEquals, {"value":attrValue,"match":"!=","attribute":attribute.name});
		onEvent(notEquals, "click", function(){
			insp.updateAssertionText(this);
		});
		col1.appendChild(equals);
		col1.appendChild(notEquals);
		if(!buttons){
			style.set(col1, {"display":"none","border":"0px"});
		}
		var col2 = document.createElement("td");
        col2.innerHTML = attribute.name;
        var col3 = document.createElement("td");
        style.set(col3, {"width": "80%"});
        input = document.createElement("input");
        if(!attribute.fieldInfo || !attribute.fieldInfo.type){
        	if(attribute.name=="date"){
        		attrValue = (new Date(attrValue)).toLocaleString();
        	}
        	col3.innerHTML = attrValue;
        	style.set(col3, {"background-color":"#ddd"});
        }
        else {
        	field = document.createElement(attribute.fieldInfo.type);
        	attr.set(field, {"value":attrValue,"attribute":attribute.name,"rows":(attribute.fieldInfo.rows?attribute.fieldInfo.rows:3)});
        	style.set(field, {"width":"100%","border":"0px","margin":"0px","padding":"1px"});
        	col3.appendChild(field);
        }
		var row = attributeList.insertRow();
		row.appendChild(col1);
		row.appendChild(col2);
		row.appendChild(col3);
		return field;
	},
	hideDialog: function(id){
		registry.byId(id).hide();
	},
	editInteraction: function(index){
		var insp = this;
		if(!registry.byId("insp_editDialog")){
			editDialog = new insp.InspectorDialog({
		    	id: "insp_editDialog",
		        title: insp.resources.strings.edit,
		        content: ''+
		        '<div class="insp_d_content">'+
		        '	<div id="insp_interactionEditor">'+
		        '		<div class="dataList" >'+
		        '			<table border="1">'+
		        '				<tbody id="insp_editAttributes"></tbody>'+
		        '			</table>'+
		        '		</div>'+
		        '	</div>'+
		        '	<div style="text-align:'+reverseAlign+'">'+
				'		<button id="insp_editPreviousButton">&larr;</button>'+
				'		<button id="insp_editNextButton" >&rarr;</button>'+
		        '	</div>'+
		        '</div>'+
		        '	<div class="inspectorToolbar" style="text-align:'+reverseAlign+'">'+
		        '		<button id="insp_closeEditInteractionButton" data-method="cancel">'+insp.resources.strings.done+'</button>&nbsp;'+
		        '	</div>',
		        onHide: function(){
		        	editDialog.destroyRecursive(false);
		        	Dialog._DialogLevelManager.hide(editDialog);
		        },
		        onShow: function(){
		    		Dialog._DialogLevelManager.show(editDialog);
		        },
		        autofocus: true,
		        refocus: false
		    });
			insp.processSimpleDialogButtons(editDialog);
			{ // buttons
				onEvent(dom.byId("insp_editPreviousButton"), "click", function(){
					insp.editInteraction(editDialog.interactionNum-1);
				});
				onEvent(dom.byId("insp_editNextButton"), "click", function(){
					insp.editInteraction(editDialog.interactionNum+1);
				});
			}
		}
		else {
			editDialog = registry.byId("insp_editDialog");
		}
		attr.remove(dom.byId("insp_editPreviousButton"), "disabled");
		attr.remove(dom.byId("insp_editNextButton"), "disabled");
		if(index===0){
			attr.set(dom.byId("insp_editPreviousButton"), {"disabled":"true"});	
		}
		if(index==inspectorData.interactions.length-1){
			attr.set(dom.byId("insp_editNextButton"), {"disabled":"true"});	
		}
		dom.byId("insp_editAttributes").innerHTML="";
		editDialog.interaction = inspectorData.interactions[index];
		editDialog.interactionNum = index;
		var keys = Object.keys(editDialog.interaction).sort();
		var idOrXpath = editDialog.interaction["id"]?"id":"xpath";
		insp.addAttributeToList(dom.byId("insp_editAttributes"), {"name":idOrXpath,"value":editDialog.interaction[idOrXpath],"fieldInfo":{"type":null}}, false);
		array.forEach(keys, function(key){
			if(key!="id" && key!="xpath"){
				var type = "TEXTAREA";
				var field = insp.addAttributeToList(dom.byId("insp_editAttributes"), {"name":key,"value":editDialog.interaction[key],"fieldInfo":{"type":type}}, false);
				if(field){
					onEvent(field, "change", function(){
						editDialog.interaction[attr.get(this, "attribute")] = this.value;
						inspectorData.interactions[editDialog.interactionNum] = editDialog.interaction;
						insp.storeData();
						insp.updateContent();
					});
				}
			}
		});
		editDialog.show();
	},
	createCustomComment: function(){
		var insp = this;
		commentDialog = new insp.InspectorDialog({
	    	id: "insp_commentDialog",
	        title: insp.resources.strings.add_comment,
	        content: '<div class="insp_d_content">'+
	        '	<input type="text" id="insp_customComment" size="50"/><br>'+
	        '	</div>'+
	        '	<div class="inspectorToolbar" style="text-align:'+reverseAlign+'">'+
	        '		<button id="insp_addCustomCommentButton">'+insp.resources.strings.add+'</button>&nbsp;'+
	        '		<button id="insp_cancelCustomCommentButton" data-method="cancel">'+insp.resources.strings.cancel+'</button>&nbsp;'+
	        '	</div>',
	        onHide: function(){
	        	commentDialog.destroyRecursive(false);
	        	Dialog._DialogLevelManager.hide(commentDialog);
	        },
	        onShow: function(){
	    		Dialog._DialogLevelManager.show(commentDialog);
	        },
	        autofocus: true,
	        refocus: false
	    });
		insp.processSimpleDialogButtons(commentDialog);
		{ // complex events
			onEvent(dom.byId("insp_customComment"), "keypress", function(e){
				if(e.keyCode==13){
					dom.byId("insp_addCustomCommentButton").click();
				}
			});
			onEvent(dom.byId("insp_addCustomCommentButton"), "click", function(){
				insp.addComment(dom.byId("insp_customComment").value);
				commentDialog.hide();
			});
		}
		style.set(commentDialog.containerNode, {"padding":"0px"});
		commentDialog.show();
		insp.centerDialogOnParent(commentDialog, inspectorDialog);
	},
	createSleep: function(){
		var insp = this;
		sleepDialog = new insp.InspectorDialog({
	    	id: "insp_SleepDialog",
	        title: insp.resources.strings.add_sleep,
	        content: '<div class="insp_d_content">'+
	        '	<input type="number" id="insp_customSleep" size="10" min="1" max="10" value="1" onkeypress="return false" /><br>'+
	        '	</div>'+
	        '	<div class="inspectorToolbar" style="text-align:'+reverseAlign+'">'+
	        '		<button id="insp_addSleepCommentButton">'+insp.resources.strings.add+'</button>&nbsp;'+
	        '		<button id="insp_cancelSleepButton" data-method="cancel">'+insp.resources.strings.cancel+'</button>&nbsp;'+
	        '	</div>',
	        onHide: function(){
	        	sleepDialog.destroyRecursive(false);
	        	Dialog._DialogLevelManager.hide(sleepDialog);
	        },
	        onShow: function(){
	    		Dialog._DialogLevelManager.show(sleepDialog);
	        },
	        autofocus: true,
	        refocus: false
	    });
		insp.processSimpleDialogButtons(sleepDialog);
		{ // buttons
			onEvent(dom.byId("insp_customSleep"), "keypress", function(e){
				if(e.keyCode==13){
					dom.byId("insp_addSleepCommentButton").click();
				}
			});
			onEvent(dom.byId("insp_addSleepCommentButton"), "click", function(){
				try {
					var sleep = parseInt(dom.byId("insp_customSleep").value);
					if(!isNaN(sleep)){
						insp.addSleep(parseInt(sleep, 10));
						sleepDialog.hide();
					}
				}
				catch(error){}
			});
		}
		style.set(sleepDialog.containerNode, {"padding":"0px"});
		sleepDialog.show();
		insp.centerDialogOnParent(sleepDialog, inspectorDialog);
	},
	addSleep: function(wait){
		try {
			var waitInt = parseInt(wait);
			if(isNaN(waitInt) || waitInt>10){
				return;
			}
			this.addInteractionNoCheck(null, {"event":"sleep","params":[wait]});
			this.storeData();
		}
		catch(error){}
	},
	makeVariable: function(){
		var insp = this;
		dataDialog = new insp.InspectorDialog({
	    	id: "insp_DataDialog",
	        title: insp.resources.strings.get_data,
	        content: ''+
	        '	<div class="notification" id="insp_makeVariable_info" style="text-align: center;height: 20px;">&nbsp;</div>'+
	        '	<div class="insp_d_content" style="width:600px;height:180px">'+
	        '		<label for="insp_variableName"><span style="color:orange">* </span>'+insp.resources.strings.variable_name+'</label><br>'+
	        '		<input type="text" id="insp_variableName" size="20" /><br><br>'+
	        '		<div style="width: 100%; height: 115px;">'+
			'	        <ul id="insp_dataTabList" class="tabGroup"><li class="current">'+insp.resources.strings.runtime+'</li><li>'+insp.resources.strings.random+'</li><li>'+insp.resources.strings.sql+'</li><li>'+insp.resources.strings.date+'</li></ul>'+
	        '			<div id="insp_variableTabs" style="margin-top: -3px; border:1px solid #999">'+
	        '   		<div id="insp_runtimeTab" style="padding:10px">'+
	        '				<label for="insp_dataId"><span style="color:orange">* </span>'+insp.resources.strings.field_id+'</label><br>'+
	        '				<input type="text" id="insp_dataId" size="30" readonly style="background-color: #e7e7e7; border: 1px solid #999; margin-right: 10px"/>'+
	        '				<button id="insp_addVariableButton" data-method="addVariable" style="vertical-align:middle; margin: 0px 5px; padding: 3px;" height: 22px; width: 22px ><img style="margin: 0px" width="18" height="18" title="" alt="" src="'+insp.resources.images.add+'" /></button>'+
	        '    		</div>'+
	        '    		<div id="insp_randomTab" style="display:none">'+
	        '				<table style="border-spacing: 5px;border-collapse: separate; float: left;">'+
			'					<tr>'+
			'						<td>'+
	        '							<label for="insp_randomType"><span style="color:orange">*</span>'+insp.resources.strings.random_type+'</label><br>'+
	        '							<select id="insp_randomType" style="height:22px">'+
	        '							</select>'+
	        '						</td>'+
			'					</tr>'+
			'				</table>'+
			'				<table id ="random_stringint" style="border-spacing: 5px;border-collapse: separate; float: left;">'+
			'					<tr>'+
	        '						<td>'+
	        '							<label for="insp_randomLength"><span style="color:orange">*</span>'+insp.resources.strings.random_length+'</label><br>'+
	        '							<input type="number" min="1" max="25" value="8" style="height:22px" id="insp_randomLength" style="border: 1px solid #999; margin-right: 10px"/>'+
			'						</td>'+
			'					</tr>'+
			'				</table>'+
			'				<table id="random_minmax" style="border-spacing: 5px;border-collapse: separate; float: left;display:none">'+
			'					<tr>'+
			'						<td>'+
			'							<label for="insp_rangeMin"><span style="color:orange">*</span>'+insp.resources.strings.random_min+'</label><br>'+
			'							<input id="insp_rangeMinNum" type="number" min="0" max="999" value="1" style="height:22px" id="insp_minLength" style="border: 1px solid #999; margin-right: 10px"/>'+
			'						</td>'+
			'						<td>'+
			'							<label for="insp_rangeMin"><span style="color:orange">*</span>'+insp.resources.strings.random_max+'</label><br>'+
			'							<input id="insp_rangeMaxNum" type="number" min="1" max="1000" value="10" style="height:22px" id="insp_maxLength" style="border: 1px solid #999; margin-right: 10px"/>'+
	        '						</td>'+
			'					</tr>'+
			'				</table>'+
			'				<table id="addButton" float: left>'+
			'					<tr>'+
	        '						<td>'+
	        '							<br><button id="insp_addRandomDataButton" data-method="addRandom" style="vertical-align:middle; margin: 0px 5px; padding: 3px;" height: 22px; width: 22px ><img style="margin: 0px" width="18" height="18" title="" alt="" src="'+insp.resources.images.add+'" /></button>'+
	        '						</td>'+
	        '					</tr>'+
	        '				</table>'+
	        '    		</div>'+
			'			<div id="insp_SqlTab" style="display:none; padding:10px;">'+
	        '				<label for="insp_sqlstmt"><span style="color:orange">* </span>'+insp.resources.strings.sql_stmt+'</label><br>'+
	        '				<input type="text" id="insp_sqlstmt" style="width:370px;padding: 3px;border:1px solid #999;" />'+
	        '				<button id="insp_makeVarSqlButton" data-method="addSql" style="vertical-align:middle; margin: 0px 5px; padding: 3px;" height: 22px; width: 22px><img style="margin: 0px" width="18" height="18" title="" alt="" src="'+insp.resources.images.add+'" /></button>'+
	        '			</div>'+
			'			<div id="insp_DateTab" style="display:none; padding:3px;">'+
			'				<table style="border-spacing: 5px;border-collapse: separate; width:520px;">'+
			'					<tr>'+
			'						<td>'+
	        '							<label for="insp_dateType"><span style="color:orange">*</span>'+insp.resources.strings.dateType+'</label><br>'+
	        '							<select id="insp_dateType" style="height:22px" >'+
	        '							</select>'+
	        '						</td>'+
			'						<td id="format_option">'+
	        '						    <label for="insp_dateFormat"><span style="color:orange">*</span>'+insp.resources.strings.date_format+'</label><br>'+
			'							<select id="insp_dateFormat" style="height:22px" >'+
			'							</select>'+
	        '						</td>'+ 
			'					</tr>'+
			'				</table>'+
			'				<table id="date_options" style="border-spacing: 5px;border-collapse: separate; width:520px; display:none">'+
			'					<tr>'+
	        '						<td id="days_option" width="40">'+
	        '							<label for="insp_dateDays"><span style="color:orange">*</span>'+insp.resources.strings.date_days+'</label><br>'+
	        '							<input type="number" min="0" max="50" value="0" style="height:22px; width:40px" id="insp_dateDays" style="border: 1px solid #999; margin-right: 10px"/>'+
	        '						</td>'+
			'						<td id="years_option" width="40">'+
	        '							<label for="insp_dateYears"><span style="color:orange">*</span>'+insp.resources.strings.date_years+'</label><br>'+
	        '							<input type="number" min="0" max="50" value="0" style="height:22px; width:40px" id="insp_dateYears" style="border: 1px solid #999; margin-right: 10px"/>'+
	        '						</td>'+
			'						<td id="months_option" width="40">'+
	        '							<label for="insp_dateMonths"><span style="color:orange">*</span>'+insp.resources.strings.date_months+'</label><br>'+
	        '							<input type="number" min="0" max="50" value="0" style="height:22px; width:40px" id="insp_dateMonths" style="border: 1px solid #999; margin-right: 10px"/>'+
	        '						</td>'+
			'						<td id="hours_option" width="40">'+
	        '							<label for="insp_dateHours"><span style="color:orange">*</span>'+insp.resources.strings.date_hours+'</label><br>'+
	        '							<input type="number" min="0" max="50" value="0" style="height:22px; width:40px" id="insp_dateHours" style="border: 1px solid #999; margin-right: 10px"/>'+
	        '						</td>'+
			'						<td id="minutes_option" width="40">'+
	        '							<label for="insp_dateMinutes"><span style="color:orange">*</span>'+insp.resources.strings.date_minutes+'</label><br>'+
	        '							<input type="number" min="0" max="50" value="0" style="height:22px; width:40px" id="insp_dateMinutes" style="border: 1px solid #999; margin-right: 10px"/>'+
	        '						</td>'+
			'						<td id="original_date_option" width="40">'+
	        '							<label for="insp_initialDate"><span style="color:orange">*</span>'+insp.resources.strings.original_date+'</label><br>'+
	        '							<input style="height:22px" id="insp_initialDate" style="border: 1px solid #999; margin-right: 10px"/>'+
	        '						</td>'+
			'						<td id="date_format_option" width="40">'+
			'							<label for="insp_dateFormatType"><span style="color:orange">*</span>'+insp.resources.strings.date_format_type+'</label><br>'+
			'							<select id="insp_dateFormatType" style="height:22px" >'+
			'							</select>'+
			'						</td>'+
			'						<td id="date_format_tz">'+
			'							<label for="insp_dateFormatTZ"><span style="color:orange">*</span>'+insp.resources.strings.date_format_timezone+'</label><br>'+
			'							<input id="insp_dateFormatTZ" type="text" size="10" value="+00:00" style="border: 1px solid #999; margin-right: 10px"/>'+
			'						</td>'+
			'						<td>'+
			'							<button id="insp_makeVarDateButton" data-method="addDate" style="vertical-align:middle; margin: 0px 5px; padding: 3px;" height: 22px; width: 22px ><img style="margin: 0px" width="18" height="18" title="" alt="" src="'+insp.resources.images.add+'" /></button>'+
			'						</td>'+
			'					</tr>'+
	        '				</table>'+
	        '				</div>'+
	        '    		</div>'+
	        '		</div>'+
	        '	</div>'+
	        '	<div class="inspectorToolbar" style="text-align:'+reverseAlign+';text-align:right;top: 0px;position: relative;">'+
	        '		<button id="insp_cancelDataButton" data-method="cancel">'+insp.resources.strings.done+'</button>&nbsp;'+
	        '	</div>',
	        onHide: function(){
	        	dataDialog.destroyRecursive(false);
	        	Dialog._DialogLevelManager.hide(dataDialog);
	        	style.set(registry.byId("insp_inspectorDialog").domNode, {"display":""});
	        },
	        onShow: function(){
	    		Dialog._DialogLevelManager.show(dataDialog);
	        },
	        autofocus: true,
	        refocus: false
	    });
		insp.processSimpleDialogButtons(dataDialog);
		{ // complex events
			onEvent(dom.byId("insp_variableName"), "keyup, change", function(e){
				insp.validateVariable();
				insp.validateRandom();						
				insp.validateDate();
			});
			onEvent(dom.byId("insp_dataId"), "keyup, change", function(){
				insp.validateVariable();
				insp.validateRandom();						
				insp.validateDate();			
			});
			var typeSelect = dom.byId("insp_randomType");
			array.forEach(Object.keys(insp.randomTypes), function(key){
				var option = document.createElement("option");
				option.innerHTML = key;
				typeSelect.appendChild(option);
			});
		    var dateTypeSelect = dom.byId("insp_dateType");
			array.forEach(Object.keys(insp.dateTypes), function(key){
				var option = document.createElement("option");
				option.innerHTML = key;
				dateTypeSelect.appendChild(option);
			});
			var dateFormatSelect = dom.byId("insp_dateFormat");
			array.forEach(Object.keys(insp.dateFormats), function(key){
				var option = document.createElement("option");
				option.innerHTML = key;
				dateFormatSelect.appendChild(option);
			});
			var dateFormatTypeSelect = dom.byId("insp_dateFormatType");
			array.forEach(Object.keys(insp.dateFormatTypes), function(key){
				var option = document.createElement("option");
				option.innerHTML = key;
				dateFormatTypeSelect.appendChild(option);
			});
			onEvent(typeSelect, "change", function(e){
				var randomType = dom.byId("insp_randomType");
				var curType = randomType.options[randomType.selectedIndex].value;
				var randomLength = dom.byId("insp_randomLength");
				
				if (curType != "range")
				{
					random_stringint.style.display = "table";
					random_minmax.style.display="none";
					var max = insp.randomTypes[this.value]["max"];
					attr.set(randomLength, "max", max);
					if(randomLength.value>max){
						randomLength.value = max;
					}
				}
				else
				{
					random_stringint.style.display = "none";
					random_minmax.style.display = "table";
					var max = insp.randomTypes[this.value]["max"];
					attr.set(randomLength,"max",max);
					if (randomLength.value>max){
						randomLength.value = max;
					}
				}
			});
			onEvent(dateTypeSelect, "change", function(e){
				var dateType = dom.byId("insp_dateType");
				var current_Type = dateType.options[dateType.selectedIndex].value;
				var dateOptionsTable = dom.byId("date_options");

				if (current_Type == ""){
			    	dateOptionsTable.style.display = "none";
				}
				if (current_Type == "today" || current_Type == "currentTime"){
					dateOptionsTable.style.display = "table";
					dom.byId("days_option").style.display = "none";
					dom.byId("years_option").style.display = "none";
					dom.byId("months_option").style.display = "none";
					dom.byId("hours_option").style.display = "none";
					dom.byId("minutes_option").style.display = "none";
					dom.byId("original_date_option").style.display = "none";
					dom.byId("date_format_option").style.display = "";
					dom.byId("date_format_tz").style.display = "none";
					dom.byId("format_option").style.display = "";
				}
				if (current_Type == "daysFromToday" || current_Type == "daysBeforeToday"){
					dateOptionsTable.style.display = "table";
					dom.byId("days_option").style.display = "";
					dom.byId("years_option").style.display = "none";
					dom.byId("months_option").style.display = "none";
					dom.byId("hours_option").style.display = "none";
					dom.byId("minutes_option").style.display = "none";
					dom.byId("original_date_option").style.display = "none";
					dom.byId("date_format_option").style.display = "";
					dom.byId("date_format_tz").style.display = "none";
					dom.byId("format_option").style.display = "";
				}
				if (current_Type == "timeFromToday" || current_Type == "timeBeforeToday"){
					dateOptionsTable.style.display = "table";
					dom.byId("days_option").style.display = "";
					dom.byId("years_option").style.display = "";
					dom.byId("months_option").style.display = "";
					dom.byId("hours_option").style.display = "";
					dom.byId("minutes_option").style.display = "";
					dom.byId("original_date_option").style.display = "none";
					dom.byId("date_format_option").style.display = "";
					dom.byId("date_format_tz").style.display = "none";
				}
				if (current_Type == "dateTimeFromDate" || current_Type == "dateTimeBeforeDate"){
					dateOptionsTable.style.display = "table";
					dom.byId("days_option").style.display = "";
					dom.byId("years_option").style.display = "";
					dom.byId("months_option").style.display = "";
					dom.byId("hours_option").style.display = "";
					dom.byId("minutes_option").style.display = "";
					dom.byId("original_date_option").style.display = "";
					dom.byId("format_option").style.display = "none";
					dom.byId("date_format_option").style.display = "";
					dom.byId("date_format_tz").style.display = "none";
				}
				if (current_Type == "currentDayOfWeek") {
					dateOptionsTable.style.display = "table";
					dom.byId("days_option").style.display = "none";
					dom.byId("years_option").style.display = "none";
					dom.byId("months_option").style.display = "none";
					dom.byId("hours_option").style.display = "none";
					dom.byId("minutes_option").style.display = "none";
					dom.byId("original_date_option").style.display = "none";
					dom.byId("format_option").style.display = "none";
					dom.byId("date_format_option").style.display = "none";
					dom.byId("date_format_tz").style.display = "none";
				}
				if (current_Type == "dayOfWeekFromDate"){
					dateOptionsTable.style.display = "table";
					dom.byId("days_option").style.display = "none";
					dom.byId("years_option").style.display = "none";
					dom.byId("months_option").style.display = "none";
					dom.byId("hours_option").style.display = "none";
					dom.byId("minutes_option").style.display = "none";
					dom.byId("original_date_option").style.display = "";
					dom.byId("format_option").style.display = "none";
					dom.byId("date_format_option").style.display = "none";
					dom.byId("date_format_tz").style.display = "none";
				}
			});
			onEvent(dateFormatTypeSelect, "change", function(e){
				var dateFormatType = dom.byId("insp_dateFormatType");
				var current_type = dateFormatType.options[dateFormatType.selectedIndex].value;
				dom.byId("date_format_option").style.display = "";				
				if (current_type != "yyyy-MM-dd'T'hh:mm:ss")
					dom.byId("date_format_tz").style.display = "none";
				else
					dom.byId("date_format_tz").style.display = "";
			});
			var tabGroup = dom.byId("insp_variableTabs");
			var links = query("li", dom.byId("insp_dataTabList"));
			var tabs = query("div", tabGroup); 
			links.forEach(function(tabLink, index){
				attr.set(tabLink, {"index":index});
				onEvent(tabLink, "click", function(){
					var tabLink = this;
					var currentIndex = attr.get(tabLink, "index");
					tabs.forEach(function(tabBody, bodyIndex){
						style.set(tabBody, {"display":currentIndex==bodyIndex?"":"none"});
					});
					links.forEach(function(link, linkIndex){
						domClass.remove(link, "current");
						if(currentIndex==linkIndex){
							domClass.add(link, "current");	
						}
					});
				});
				onEvent(tabLink, "mouseover", function(){
					if(domClass.contains(this, "current")!==true){
						style.set(this, {"color":"blue"});
					}
				});
				onEvent(tabLink, "mouseout", function(){
					style.set(this, {"color":"black"});
				});
			});
		}
		style.set(dataDialog.containerNode, {"padding":"0px"});
		dataDialog.show();
		insp.validateVariable();
		insp.validateRandom();						
		insp.validateDate();											
		insp.centerDialogOnParent(dataDialog, inspectorDialog);
		style.set(registry.byId("insp_inspectorDialog").domNode, {"display":"none"});
		var underlay = dom.byId("insp_DataDialog_underlay");
		style.set(underlay, {"background":"transparent"});
		onEvent(underlay, "mousemove", function(e){
			var runtimeTab=dom.byId("insp_runtimeTab");
			if(runtimeTab && attr.get(runtimeTab, "display")!="none"){
				if(insp.highlightHover && insp.highlightHover!=insp.assertHighlight){
					insp.removeHighlights();
				}
				style.set(this, {"display":"none"});
				var node = document.elementFromPoint(e.clientX, e.clientY);
				style.set(underlay, {"display":""});
				if(node != insp.assertHighlight && node.tagName=="INPUT"){
					insp.highlightHover = node;
					insp.addHighlight(node, "2px solid blue");
				}
				if(node != insp.assertHighlight && (node.tagName=="IMG" && node.id.indexOf("cb_img") > 0)){
					insp.highlightHover = node;
					insp.addHighlight(node, "2px solid blue");
				}
				if(node != insp.assertHighlight && (node.tagName=="IMG" && node.id.indexOf("checkbox-cb") > 0)){
					insp.highlightHover = node;
					insp.addHighlight(node, "2px solid blue");
				}				
				if(node != insp.assertHighlight && node.tagName=="LABEL" && node.id.indexOf("lb3") > 0){
					insp.highlightHover = node;
					insp.addHighlight(node, "2px solid blue");
				}
				if (node != insp.assertHighlight && node.tagName == "DIV") {
					insp.highlightHover = node;
					insp.addHighlight(node, "2px solid blue");
				}
			}
		});
		this.clickHandler = onEvent(underlay, "mousedown", function(e){
			if(attr.get("insp_runtimeTab", "display")!="none"){
	    		style.set(this, {"display":"none"});
                var node = document.elementFromPoint(e.clientX, e.clientY);
				style.set(underlay, {"display":""});
	    		e.cancelBubble = true;
				e.preventDefault();
				if(node.tagName=="INPUT" || node.tagName == "LABEL" || node.tagName == "TD" || (node.tagName == "IMG" && node.id.indexOf("cb_img") > 0) || (node.tagName == "IMG" && node.id.indexOf("checkbox-cb") > 0) || node.tagName == "DIV"){
					dom.byId("insp_dataId").value = node.id;
					dom.byId("insp_variableName").focus();
					insp.validateVariable();
					insp.validateRandom();
				}
			}	
    	});
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
	addRandom: function(){
		var insp = this;
		if(insp.validateRandom()){
			var variable = dom.byId("insp_variableName").value;
			insp.varNames.push(variable);
			var type = dom.byId("insp_randomType").value;
			if (type != "range")
				var length = dom.byId("insp_randomLength").value;
			else
			{
				var min = dom.byId("insp_rangeMinNum").value;
				var max = dom.byId("insp_rangeMaxNum").value;
			}
			if (type != "range")
				var note = insp.updateParams(insp.resources.strings.random_created, ["<span class='variable'>"+variable+"</span>", type, length]) ;
			else
				var note = insp.updateParams(insp.resources.strings.random_minmaxcreated,["<span class='variable'>"+variable+"</span>", min, max]);
			if (type != "range")
				insp.addInteractionNoCheck(null, {"event":"makeVariable","random":type+":"+length,"params":[variable],"comment":note});
			else
				insp.addInteractionNoCheck(null, {"event":"makeVariable","random":type+":min:"+min+",max:"+max,"params":[variable],"comment":note});
			insp.showNotification(note, 0);
			dom.byId("insp_variableName").value="";
		}
	},
	validateRandom: function(){
		var varField = dom.byId("insp_variableName");
		var variable = varField.value;
		if(this.varNames.indexOf(variable)===-1 && variable.length>=this.minVariableNameLength){
			if(isNaN(parseInt(variable.substring(0,1)))){//makes sure we do not start with a number
				this.setButtonEnabled(dom.byId("insp_addRandomDataButton"), true);
				style.set(varField, "color", "black");
				return true;
			}
		}
		style.set(varField, "color", "red");
		this.setButtonEnabled(dom.byId("insp_addRandomDataButton"), false);
		return false;
	},
	addSql: function(){
		var insp = this;
		if(insp.validateSqlVariable()){
			var variable = dom.byId("insp_variableName").value;
			insp.varNames.push(variable);
			var id = dom.byId("insp_sqlstmt").value;
			var note = insp.updateParams(insp.resources.strings.variable_created, ["<span class='variable'>"+variable+"</span>",id]);
			insp.addInteractionNoCheck(null, {"event":"makeVariable","sql":id,"params":[variable],"comment":note});
			insp.showNotification(note, 0);
			dom.byId("insp_variableName").value="";
			dom.byId("insp_sqlstmt").value="";
		}
	},
	validateSqlVariable: function(){
		var nameValid = false;
		var idValid = false;
		var varField = dom.byId("insp_variableName");
		var variable = varField.value;
		if(this.varNames.indexOf(variable)===-1 && variable.length>=this.minVariableNameLength){
			if(isNaN(parseInt(variable.substring(0,1)))){
				nameValid = true;
			}
		style.set(varField, "color", nameValid?"black":"red");
		var id = dom.byId("insp_sqlstmt").value;
		if (id.length>0) {
			idValid=true;
		}
		this.setButtonEnabled(dom.byId("insp_makeVarSqlButton"), (nameValid && idValid));
		return nameValid && idValid;		
		}	
	},
	addDate: function(){
		var insp = this;
		if(insp.validateDate()){
			var variable = dom.byId("insp_variableName").value;
			insp.varNames.push(variable);
			var type = dom.byId("insp_dateType").value;
			if (type != "dateTimeFromDate" && type != "dateTimeBeforeDate")
				var format = dom.byId("insp_dateFormat").value;
			var blank = false;
			var note = insp.updateParams(insp.resources.strings.variable_created, ["<span class='variable'>"+variable+"</span>", type]) ;
				if (format=="" && type != "dateTimeFromDate" && type != "dateTimeBeforeDate"){
					var blank = true;
				}
				var dateFormat = dom.byId("insp_dateFormatType").value;
				if (dateFormat.indexOf("T") > -1) {
					var tz = dom.byId("insp_dateFormatTZ").value;
					var dateFormat = dateFormat+tz;
				}
				if(type == "today" && blank !== true || type == "currentTime" && blank !== true){
					insp.addInteractionNoCheck(null, {"event":"makeVariable","params":[variable],"date":[{"date":type,"format":format,"dateFormat":dateFormat}],"comment":note});
					insp.showNotification(note, 0);
				}
				else if(type == "daysFromToday" && blank !== true || type == "daysBeforeToday" && blank !== true){
					var days = dom.byId("insp_dateDays").value;
					insp.addInteractionNoCheck(null, {"event":"makeVariable","params":[variable],"date":[{"date":type,"format":format, "days":days,"dateFormat":dateFormat}],"comment":note});
					insp.showNotification(note, 0);
				}
				else if(type == "timeFromToday" && blank !== true || type == "timeBeforeToday" && blank !== true){
					var days = dom.byId("insp_dateDays").value;
					var months = dom.byId("insp_dateMonths").value;
					var years = dom.byId("insp_dateYears").value;
					var hours = dom.byId("insp_dateHours").value;
					var minutes = dom.byId("insp_dateMinutes").value;
					insp.addInteractionNoCheck(null, {"event":"makeVariable","params":[variable],"date":[{"date":type,"format":format, "days":days, "months":months, "years":years, "hours":hours, "minutes":minutes,"dateFormat":dateFormat}],"comment":note});
					insp.showNotification(note, 0);
				}
				else if (type == "dateTimeFromDate" && blank !== true || type == "dateTimeBeforeDate" && blank !== true) {
                    var days = dom.byId("insp_dateDays").value;
                    var months = dom.byId("insp_dateMonths").value;
                    var years = dom.byId("insp_dateYears").value;
					var hours = dom.byId("insp_dateHours").value;
					var minutes = dom.byId("insp_dateMinutes").value;
					var originalDate = dom.byId("insp_initialDate").value;
					insp.addInteractionNoCheck(null, {"event":"makeVariable","params":[variable],"date":[{"date":type, "initialDate":originalDate, "days":days,"months":months,"years":years,"hours":hours,"minutes":minutes,"dateFormat":dateFormat}],"comment":note});
					insp.showNotification(note, 0);
				}
				else if (type == "currentDayOfWeek") {
					insp.addInteractionNoCheck(null, {"event":"makeVariable","params":[variable],"date":[{"date":type}],"comment":note});
					insp.showNotification(note, 0);
				}
				else if (type == "dayOfWeekFromDate") {
					var originalDate = dom.byId("insp_initialDate").value;
					insp.addInteractionNoCheck(null, {"event":"makeVariable","params":[variable],"date":[{"date":type,"inputDate":originalDate}],"comment":note});
					insp.showNotification(note, 0);
				}

			dom.byId("insp_variableName").value="";
			if (dom.byId("insp_initialDate").value !== "")
				dom.byId("insp_initialDate").value = "";
		}
	},
	validateDate: function(){
		var varField = dom.byId("insp_variableName");
		var variable = varField.value;
			if(this.varNames.indexOf(variable)===-1 && variable.length>=this.minVariableNameLength){
				if(isNaN(parseInt(variable.substring(0,1)))){//makes sure we do not start with a number
					this.setButtonEnabled(dom.byId("insp_makeVarDateButton"), true);
					style.set(varField, "color", "black");
					return true;
				}
			}
		style.set(varField, "color", "red");
		this.setButtonEnabled(dom.byId("insp_makeVarDateButton"), false);
		return false;
	},
	validateVariable: function(){
		var nameValid = false;
		var idValid = false;
		var varField = dom.byId("insp_variableName");
		var variable = varField.value;
		if(this.varNames.indexOf(variable)===-1 && variable.length>=this.minVariableNameLength && isNaN(parseInt(variable.substring(0,1)))){
			nameValid = true;
		}
		style.set(varField, "color", nameValid?"black":"red");		
		
		var id = dom.byId("insp_dataId").value;
		if(id.length>0){
			idValid = true;
		}
		this.setButtonEnabled(dom.byId("insp_addVariableButton"), (nameValid && idValid));
		
		return nameValid && idValid;
	},
	addComment: function(comment){
		try {
			if(comment.trim().length>0){
				this.addInteractionNoCheck(null, {"comment":comment});
				this.storeData();
			}
		}
		catch(error){}
	},
	addInteractionNoCheck: function(e, interaction){
		var recording = inspectorData.recording;
		inspectorData.recording=true;
		this.addInteraction(e, interaction);
		inspectorData.recording = recording;
	},
	addInteraction: function(e, interaction){
		if(!inspectorData.recording){
			return;
		}

		var lastInteraction;
		if(inspectorData.interactions){
            console.log("id:" + interaction.id + ", event:" + interaction.event);
			lastInteraction = inspectorData.interactions[this.currentInteraction];
			if (lastInteraction === undefined){
				this.currentInteraction = inspectorData.interactions.length - 1;
				lastInteraction = inspectorData.interactions[this.currentInteraction];
			}
            if (interaction.id && interaction.id.startsWith("insp_"))
                return;
			if(lastInteraction && lastInteraction.id == interaction.id && lastInteraction.event == interaction.event ){
				if(interaction.event == 'mouseover'){
					return;
				}
				else if (lastInteraction.event == 'click' && interaction.event == 'click') {
				if (lastInteraction.comment != interaction.comment && interaction.id.indexOf('collapsible_section_collapse_button') == -1 && interaction.id.indexOf("publishButton") == -1){
						if ((interaction.id.indexOf('_wrapper') == -1))
							return;
					}
                else if (interaction.id.indexOf("location_description_") > -1)
                    return;
                else if (lastInteraction && lastInteraction.id == interaction.id && lastInteraction.eventType == 'mouseup' && interaction.event == 'click' && lastInteraction.comment == interaction.comment)
                    return;
				}
  			}
            else if (lastInteraction && lastInteraction.event === 'mouseup' && interaction.event === 'click' && lastInteraction.comment === "Click the close icon on the dialog" && interaction.comment === "Click the close icon on the dialog")
                return;
			else if (lastInteraction && interaction.id !== undefined && interaction.id.indexOf("_trigger_icon") > -1 && (lastInteraction.id +"_icon") == interaction.id)
				return;
			else if (lastInteraction && interaction.id == (lastInteraction.id + "div") && lastInteraction.event == 'select' && interaction.event == 'click')
				return;
			else if (interaction.comment == "Click the Set as home icon" && (interaction.id == 'tool_inspectorsup'))
				return;	
			else if (lastInteraction && lastInteraction.id == 'revisionList_description_input' && interaction.id == 'inspectorsupmain_revisionList_description')
				return;
			else if (interaction.id === '' && interaction.comment.indexOf("Click the  checkbox") > -1)
				return;
            else if (interaction.comment !== undefined && (interaction.comment.indexOf("DataSource Footer list item") > -1 || interaction.comment.indexOf("Simple Dropdown list item") > -1 || interaction.comment.indexOf("DataSource Footer div") > -1))
                return;
            else if (lastInteraction && interaction.id === lastInteraction.id && lastInteraction.event === "clickTableRowExpandCollapseButton" && interaction.event === "clickTableRowExpandCollapseButton" && lastInteraction.eventType === "mouseup" && interaction.eventType === "click")
                return;
            else if (lastInteraction && interaction.id === '' && interaction.xpath !== undefined && interaction.xpath !== '' && interaction.xpath.indexOf("bx--table-expand__button") > -1)
                return;
            else if (interaction.id === '' && interaction.xpath !== undefined && interaction.xpath !== '' && interaction.xpath.indexOf("SVGAnimatedString") > -1)
                return;
            else if (lastInteraction && lastInteraction.comment && lastInteraction.comment.indexOf("expand/collapse") > -1 && lastInteraction.eventType === "mouseup" && interaction.comment.indexOf("expand/collapse") > -1 && interaction.eventType === "click")
                return;
            else if (lastInteraction && lastInteraction.comment && lastInteraction.comment.indexOf("expand/collapse") > -1 && interaction.id === '' && interaction.comment === "Click the  button")
                return;
            else if (interaction.id === '' && interaction.eventType === undefined && interaction.comment === "Click the undefined list item")
                return;
            else if (interaction.id === '' && interaction.eventType === undefined && interaction.comment === "Click the  div")
                return;
            else if (lastInteraction && lastInteraction.id === '' && interaction.id === '' && lastInteraction.comment === interaction.comment)
                return;
            else if (lastInteraction !== undefined && lastInteraction.event !== undefined && lastInteraction.event === "clickMultiselectDropdownClearSelectionIcon" && interaction.event === "clickDropdown" && ((currentTimeStamp - lastTimeStamp) < 55) && ((currentTimeStamp - lastTimeStamp) > 5)) 
				return;
            else if (lastInteraction && lastInteraction.event === "clickTableHeaderButton" && interaction.event === "clickTableRowButton" && interaction.button === '')
                return;
            else if (lastInteraction && lastInteraction.comment && (lastInteraction.comment.indexOf("hidedialog : ") > -1|| lastInteraction.comment.indexOf("showdialog : ") > -1) && (interaction.comment.indexOf("hidedialog : ") > -1 ||interaction.comment.indexOf("showdialog : ") > -1) && lastInteraction.comment == interaction.comment)
                return;
            else if (lastInteraction && lastInteraction.eventType === "mouseup" && interaction.event === "click" && lastInteraction.id === interaction.id+"_icon")
                return;
            else if (interaction.id === '' && interaction.comment === "Click the undefined svg")
                return;
            else if (lastInteraction && lastInteraction.event === "click" && (interaction.event === "clickTableHeaderButton" && interaction.tableClass === "bx--accordion__item"))
                return;
            else if (lastInteraction && lastInteraction.event === "click" && (interaction.event === "clickTableHeaderButton" && interaction.tableClass === "dockedHeader"))
                return;
            else if (lastInteraction && lastInteraction.event === "clickDialogButton" && interaction.event === "clickDialogButton" && lastInteraction.eventType === "mouseup" && interaction.eventType === "click" && lastInteraction.id === interaction.id)
                return;
            else if (lastInteraction && interaction.event === "clickDropdown" && lastInteraction.event === "click"){
                var newString = interaction.id.replaceAll("dropdown","icon");
                if (newString === lastInteraction.id)
                    return;
            }
            else if (lastInteraction && interaction.event === "click" && lastInteraction.event === "click" && interaction.comment.endsWith("div") && lastInteraction.comment.endsWith("date field") && interaction.id === "")
                return;
            else if (interaction)
			if (this.commentCheck && lastInteraction && (lastInteraction.comment == interaction.comment) && (lastInteraction.id === interaction.id)){
				return;
			}
		}
		if(e){
			interaction.eventType = e.type;
		}
		this.saveHistory();
		var index = this.currentInteraction+1;
		var shift = this.shiftInteraction(e, interaction);
		index = index + shift;
		inspectorData.interactions.splice(index, 0, interaction);
		this.addInteractionToContent(index);
		this.reNumberInteractionList();
		this.setCurrentInteraction(index-shift);
		this.storeData();
        this.addInspectionPoints(win.body());
	},
	clearInteractions: function(){
		var insp = this;
		insp.confirm(insp.resources.strings.confirm_clear, (inspectorData.interactions.length>0), function(){
			inspectorData.binConfiguration = {};
			inspectorData.interactions = [];
			insp.setCurrentInteraction(-1);
			insp.storeData();
			insp.updateContent();
			insp.showNotification(insp.resources.strings.clear_all, 0);
			this.history = [];
		}, null);
	},
	fetchInspectorData: function(headlessOption){
		if(this.canUseLocalStorage()) {
			var inspectorData = (localStorage?localStorage:window.localStorage).getItem(this.dataId);
			if(inspectorData && inspectorData!="undefined") {
				return dojo.fromJson(inspectorData);
			}
			
		if (headlessOption == true)
		{
			var recording = true;
			var headless = true;
		}	
		else
		{
			var recording = false;
			var headless = false;
		}			
			
			// set defaults
			return {"interactions":[], "recording": recording, "inspecting": true, "options":{"recordHovers":"false","comments":"end","headless":headless, "mode":""}};
		}
	},
	undo: function(){
		var currentHistory = this.history.pop();
		if(currentHistory){
			inspectorData.interactions = JSON.parse( JSON.stringify( currentHistory ) );
			this.updateContent();
			if(inspectorData.interactions.length===0){
				this.setCurrentInteraction(-1);
			}
			else {
				this.setCurrentInteraction(inspectorData.interactions.length-1);
			}
		}
		this.setButtonEnabled(dom.byId("insp_undoButton"), (inspectorData.interactions.length!==0));
	},
	saveHistory: function() {
		var interactionsCopy = JSON.parse( JSON.stringify( inspectorData.interactions ) );
		this.history = []
		this.history.push(interactionsCopy);
		this.setButtonEnabled(dom.byId("insp_undoButton"), true);
	},
	storeData: function() {
		if(this.canUseLocalStorage()) {
			(localStorage?localStorage:window.localStorage).setItem(this.dataId, dojo.toJson(inspectorData));
		}
		var disabled = (!inspectorData.interactions || inspectorData.interactions.length===0) && (!inspectorData.binConfiguration || Object.keys(inspectorData.binConfiguration).length===0);
		try { //these may not have been created
			setButtonEnabled(dom.byId("insp_exportButton"), !disabled);
		}
		catch(error){}
		var insp = this;
		insp.varNames = [];
		array.forEach(inspectorData.interactions, function(interaction){
			if(interaction.event && interaction.event==("makeVariable")){
				insp.varNames.push(interaction.params[0]);
			}
		});
	},
	hide: function(){
		style.set(inspectorDialog.domNode, {"display":"none"});
		inspectorData.hidden = "true";
	},
	show: function(){
		style.set(inspectorDialog.domNode, {"display":""});
		delete inspectorData.hidden;
	},
	canUseLocalStorage: function()
	{
		try
		{
			return 'localStorage' in window && window['localStorage'] !== null;
		}
		catch (e)
		{
			return false;
		}
	},
	//allows extension to block recording when needed
	canRecord: function(){
		return inspectorData.recording;
	},
	recordInteraction: function(e){
		var insp = this;
		var node;
        var nodeType;
		currentTimeStamp = new Date().getTime();
		if(insp.canRecord()){
			if((e && (e.recorded))){ //This event has been handled so don't record again.
				return;
			}
			var type, interaction;
			if(typeof e == "string"){
				node = dom.byId(e);
				type = "click";
				e = null;
			}
			else {
				node = e.currentTarget;
				type = e.type;
			}
            if (node.className != null){
                if (node.id === "workscape_workscape" || node.id === "crcontent_dataSetdatalist_datalist" || node.id === "perils_data_availProductDatalist_datalist" || node.id === "healthpmtab_panelcontainer1_container" || node.id === "healthpmtab_pmchartpanel_internal" || node.id === "technicianmain_pages_appPages" || node.id === "internal" || node.id === "assetlist_assetpanel_internal" || node.id === "healthoverviewtab_panelcontainer_container" || node.id === "navigationmenu_WCHeading" || node.id.indexOf("sidePaperitem") > -1 || node.id === "workscape-approvework_approveWorkPanel_internal" || node.id === "mainCarousel_carousel" || node.id === "myPages_appPages" || node.id === "workscape-ownerwork_ownerWorkPanel_internal" || node.id === "panelSlider_container" || node.id === "crcontent_attributedatalist_datalist" || node.id === "crcontent_chosendatalist_datalist" || node.id === "deffilter_querydatalist_datalist" || node.id === "executionContainer_questionlist_datalist" || node.id === "card" || node.id.indexOf("_appPages") > -1 || (node.hasOwnProperty("className") && node.id === "" && node.className.indexOf("maximo-flipper") > -1 && node.title === "") || (node.hasOwnProperty("className") &&node.className === "flex-container"))
                    return;	
            }
            
            var iconName = null;
            var hasClassProp = false;
            var hascls = node.className.length;
            if (hascls > 0)
                hasClassProp = true;
            if (type.match("change") && node.id.indexOf("-rb") > 0)
				return;
			if (type.match("change") && node.id.indexOf("CheckBox") > 0)
				return;
            if (hasClassProp && node.className === "bx--dropdown bx--dropdown--open bx--list-box bx--list-box--expanded")
                return;
            if (hasClassProp && node.nodeName.toLowerCase() === "button" && node.className.indexOf("TableToolbar__ToolbarSVGWrapper") > -1)
                return;
            if (hasClassProp && node.className === "flex-container" && node.className.indexOf("mx--datalist-flex") === -1)
                return;
            if (hasClassProp && type.match("click") && node.className === "bx--form-item bx--checkbox-wrapper")
                return;
            if (node.tagName.toLowerCase() === "svg" && node.textContent === "Open menu" && node.parentNode.className === "bx--list-box__menu-icon")
                return;
            if (node.tagName.toLowerCase() === "svg" && node.parentNode.className.indexOf("RowActionsCell__StyledOverflowMenu") > -1)
                return;
            if (type.match("change") && node.className === "bx--form-item" && node.parentNode.className === "mx--toggle bx--form-item")
                return;
            if (node.className === "bx--modal-close" && node.id === '' && node.nodeName.toLowerCase() === "button")
                return;
            if (node.className === "bx--link" && node.nodeName.toLowerCase() === "a")
                return;
            if (type.match("mouseup") && node.parentNode.className.indexOf("bx--number__control-btn") > -1)
                return;
            if (type.match("mouseup") && node.parentNode.className.indexOf("bx--header-action-btn bx--header__action") > -1)
                return;
            if (node.nodeName.toLowerCase() === "svg" && node.parentNode.className.indexOf("bx--btn--icon-only") > -1 && node.parentNode.nodeName.toLowerCase() === "button")
                return;
           
 			if (node.id === "" && node.hasOwnProperty("innerText") && node.innerText.indexOf("IBMProject Mitchell") > -1)
				node = node.parentNode;
            else if (node.id === "" && node.hasOwnProperty("className") && node.className.indexOf("bx--toggle__appearance") > -1)
                node = node.parentNode.previousSibling;
            else if (node.id === "" && node.nodeName === "path"){
                if (node.tagName.toLowerCase() === "path" && node.parentNode.tagName.toLowerCase() === "svg" && (node.parentNode.parentNode.className.indexOf("down-icon") > -1 || node.parentNode.parentNode.className.indexOf("up-icon") > -1))
                    node = node.parentNode.parentNode;
                else
                    node = node.parentNode;
            }
            else if (node.nodeName.toLowerCase() === "svg" && node.parentNode.className.indexOf("mx--button") > -1 && node.parentNode.nodeName.toLowerCase() === "button")
                node = node.parentNode;
            else if (node.nodeName.toLowerCase() === "svg" && node.parentNode.className === "divider" && node.parentNode.nodeName.toLowerCase() === "div")
                node = node.parentNode;
            else if (node.className === "bx--accordion__heading")
                node = node.parentNode.parentNode;
            else if (node.className === "bx--tile-content")
                node = node.childNodes[0].childNodes[0];
            else if (node.id === '' && node.parentNode.parentNode.className === "bx--tooltip__label")
                node = node.parentNode.parentNode;
            else if (node.id === '' && node.tagName.toLowerCase() === "svg" && node.parentNode.tagName.toLowerCase() === "button" && node.parentNode.className.indexOf("TableHead__") > -1)
                node = node.parentNode;
            else if (node.tagName.toLowerCase() === "input" && node.className.indexOf("bx--search-input") > -1 && type === "mousedown"){
                node = node.parentNode.parentNode;
                iconName = "Search";
            }
            else if (hasClassProp && node.tagName.toLowerCase() === "a" && node.className === "itemtext style-scope maximo-navigationmenu")
                node = node.parentNode;
            else if (hasClassProp && node.tagName.toLowerCase() === "a" && node.className === "style-scope maximo-workscape")
                node = node.childNodes[1];
            else if (hasClassProp && node.className.indexOf("bx--header__menu-item") > -1)
                node = node.parentNode;
            else if (node.tagName.toLowerCase() === "svg" && node.getAttribute("aria-label") && node.getAttribute("aria-label").indexOf("Column Selection") > -1){
                node = node.parentNode.parentNode.parentNode.parentNode;
                iconName = "Column Selection";
            }
            else if (node.tagName.toLowerCase() === "svg" && node.getAttribute("aria-label") && node.getAttribute("aria-label").indexOf("Filters") > -1){
                node = node.parentNode.parentNode.parentNode.parentNode;
                iconName = "Filters";
            }
            else if (node.tagName.toLowerCase() === "button" && node.textContent === "Clear all filters"){
                node = node.parentNode.parentNode.parentNode;
                iconName = "Clear all filters";
            }
            else if (node.className === "bx--list-box__field")
                node = node.parentNode;
            else if (node.tagName.toLowerCase() === "svg" && node.parentNode.tagName.toLowerCase() === "button" && (node.parentNode.className.indexOf("down-icon") > -1 || node.parentNode.className.indexOf("up-icon") > -1))
                node = node.parentNode;
            else if (node.tagName.toLowerCase() === "svg" && node.previousSibling !== null && node.previousSibling.nodeName.toLowerCase() !== "#text" && node.previousSibling.className.length > 0 && node.previousSibling.className.indexOf("bx--date-picker__input") > -1){
                node = node.previousSibling;
                hasClassProp = true;
            }
            else if (node.className === "bx--select-input__wrapper")
                node = node.childNodes[0];
            else if (hasClassProp && node.id === '' && node.className.indexOf("RowActionsCell__OverflowMenuContent") > -1)
                node = node.childNodes[0];
            else if (node.tagName.toLowerCase() === "svg" && node.parentNode.className.indexOf("bx--header-action-btn") > -1)
                node = node.parentNode;
            else if (node.tagName.toLowerCase() === "svg" && node.parentNode.className === "bx--modal-close")
                node = node.parentNode;
            else if (node.tagName.toLowerCase() === "svg" && node.parentNode.parentNode.className.indexOf("bx--side-nav__link") > -1)
                node = node.nextSibling;
            else if (node.tagName.toLowerCase() === "svg" && node.parentNode.className.indexOf("mx--tag-action-icon") > -1)
                node = node.parentNode;
            else if (node.tagName.toLowerCase() === "svg" && node.parentNode.parentNode.parentNode.parentNode.className.indexOf("iot--tableheader-filter") > -1)
                node = node.parentNode.parentNode.parentNode.parentNode;
            
            if (type === "change" && node.className.indexOf("bx--date-picker__input") > -1)
                return;
            else if (hasClassProp && type === "mouseup" && node.className.indexOf("bx--number__control") > -1)
                return;
            
            if (node.tagName.toLowerCase() === "input" && (node.id === "rb_checked" || node.id === "rb_unchecked"))
                return;
            
			if(!node || node == window || !node.id || node.id.length===0){
				console.log("no id for element");
				xPath = this.missingId(e, node);
			}
			if(node !== null && node.tagName){
				switch(type){
					case "change":
                        lastInteraction = inspectorData.interactions[this.currentInteraction];
                        var comment = insp.buildComment(type, e, node);
						if (node.id.indexOf("tfrow") > -1){
							if (lastInteraction.id !== undefined)
							{	
								if (lastInteraction.id.indexOf("tfrow") > -1 && lastInteraction.eventType === "keydown" && lastInteraction.params[0] === 13)
								{
									this.deleteInteraction(this.currentInteraction);
									this.addInteraction(e, {"event":"typeover","id":node.id,"params":[node.value],"comment":comment});
									this.addInteraction(lastInteraction.event, lastInteraction);
								}
								else
									this.addInteraction(e, {"event":"typeover","id":node.id,"params":[node.value],"comment":comment});
							}
							else
								this.addInteraction(e, {"event":"typeover","id":node.id,"params":[node.value],"comment":comment});
							}
						else if (lastInteraction !== undefined && lastInteraction.eventType === "mousedown" && lastInteraction.id != node.id && ((currentTimeStamp - lastTimeStamp) < 50))
						{
								this.deleteInteraction(this.currentInteraction);
								this.addInteraction(e, {"event":"typeover","id":node.id,"params":[node.value],"comment":comment});
								this.addInteraction(lastInteraction.event, lastInteraction);
						}	
						else if (lastInteraction !== undefined && lastInteraction.eventType === "click" && lastInteraction.id === node.id && ((currentTimeStamp - lastTimeStamp) < 75) && ((currentTimeStamp - lastTimeStamp) > 5))
						{
								this.deleteInteraction(this.currentInteraction);
								this.addInteraction(e, {"event":"typeover","id":node.id,"params":[node.value],"comment":comment});
								this.addInteraction(lastInteraction.event, lastInteraction);
						}	
                        else if (node.nodeName.toLowerCase() === "div" && node.className.indexOf("bx--multi-select") > -1) {
                            var inputNode = node.childNodes[0].childNodes[0];
                            this.addInteraction(e, {"event":"typeover","id":inputNode.id,"params":[inputNode.value],"comment":"Type " +inputNode.value +" in the filter field"});
                        }
                        else if (node.nodeName.toLowerCase() === "select" && node.className.indexOf("bx--select-input") > -1){
                            var menuitem = node.value;
                            var footerSide = node.parentNode.parentNode.parentNode.parentNode.parentNode.className;
                            footerSide = footerSide.substring(16);
                            var tableClass = node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.className;
                            tableClass = tableClass.split(" ");
                            tableClass = tableClass[0];
                            interaction = {"event":"clickDropdownItem","id":tableClass,"footerSide":footerSide,"menuitem":menuitem,"comment":"Click the " +menuitem+ " menuitem"}; 
                        }
                        else if (node.tagName.toLowerCase() === "div" && node.className === "bx--form-item bx--checkbox-wrapper")
                            this.addInteraction(e, {"event":"selectCheckbox","id":node.childNodes[0].id,"comment":"Click the checkbox"});
                        else if (node.tagName.toLowerCase() === "input" && node.className === "bx--radio-button"){
                            var rbLabel = node.nextSibling.childNodes[1];
                            this.addInteraction(e, {"event":"click","id":node.id,"comment":"Click the " + rbLabel.textContent+ " radio button"})
                        }
                        else if (hasClassProp && node.tagName.toLowerCase() === "input" && node.type === "number" && node.className === "numInput cur-year")
                            this.addInteraction(e, {"event":"typeover","params":[node.value],"comment":"Type " +node.value + " in the date picker year field"});
                        else if (node.tagName.toLowerCase() === "input" && node.type === "number"){
                            var fieldLabel = node.parentNode.previousSibling;
                            if (fieldLabel != null)
                                this.addInteraction(e, {"event":"typeover","id":node.id,"params":[node.value],"comment":"Type " +node.value + " in the " + fieldLabel.textContent + " field"});
                            else
                               this.addInteraction(e, {"event":"typeover","id":node.id,"params":[node.value],"comment":"Type " +node.value + " in the field"}); 
                        }
                        else if (node.tagName.toLowerCase() === "textarea"){
                            var textareaLabel = node.parentNode.parentNode.previousSibling.childNodes[1].childNodes[0].textContent;
                            this.addInteraction(e, {"event":"typeover","id":node.id,"params":[node.value],"comment":"Type " + node.value + " in the "+textareaLabel+" textarea"});
                        }
						else if (hasClassProp && node.tagName.toLowerCase() === "input" && node.className.indexOf("bx--time-picker__input-field") > -1){
                            var parentNode = node.parentNode.parentNode.parentNode;
                            var fieldLabel = parentNode.childNodes[0].textContent;
                            if (fieldLabel === '' || fieldLabel === " " || fieldLabel.indexOf("AMPM") > -1)
                                fieldLabel = parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.childNodes[0].childNodes[0].textContent;
                            this.addInteraction(e, {"event":"typeover","id":node.id,"params":[node.value],"comment":"Type " + node.value + " in the "+fieldLabel+" time field"});
                        }
                        else if (hasClassProp && node.tagName.toLowerCase() === "input" && node.className.indexOf("mx--duration-input") > -1){
                            var label = node.parentNode.parentNode.parentNode.textContent;
                            var type = null;
                            if (node.className.indexOf("hour-input") > -1)
                                type = "hour";
                            else
                                type = "minute";
                            this.addInteraction(e, {"event":"typeover","id":node.id,"params":[node.value],"comment":"Type " + node.value + " in the "+label+" "+type+" field"});
                        }
                        else if (hasClassProp && node.tagName.toLowerCase() === "input" && node.className.indexOf("bx--text-input") > -1){
                            var label = null;
                            var hasSibling = node.parentNode.parentNode.previousSibling;
                            if (hasSibling != null)
                                label = node.parentNode.parentNode.previousSibling.textContent;
                            else
                                label = "";
                            this.addInteraction(e, {"event":"typeover","id":node.id,"params":[node.value],"comment":"Type " + node.value + " in the "+label+ " field"});
                        }
                        else
							this.addInteraction(e, {"event":"typeover","id":node.id,"params":[node.value],"comment":comment});
						if(e){
							e.recorded = true;
						}
						break;
					case "keydown":
						var key = this.getKey(node, e.keyCode, ((e.ctrlKey)?"CTRL":"")+((e.altKey)?"ALT":"")+((e.shiftKey)?"SHIFT":""));
						if((key || e.keyCode==13 || (e.ctrlKey && e.altKey)) &&(e.keyCode!=17 && e.keyCode!=18)){ //hotkey mods
							if(e.keyCode!=13 || !e.ctrlKey){
								var comment = insp.buildComment(type, e, node);
								window.setTimeout(function(){
									insp.addInteraction(e, {"event":"keystroke","id":node.id,
										"params":[e.keyCode,String.fromCharCode(e.keyCode).toLowerCase(),
										          e.ctrlKey,e.altKey,e.shiftKey],"comment":comment});
								}, 500);
								if(e){
									e.recorded = true;
								}
							}
						}
						break;
					case "keypress":
							if((e.ctrlKey || e.altKey) && e.keyCode != 16 && e.keyCode != 17 && e.keyCode != 18 && e.keyCode != 10 ){
								interaction = {"event":type,"id":node.id,"params":[e.keyCode,String.fromCharCode(e.keyCode),e.ctrlKey,e.altKey,e.shiftKey],
										"comment":insp.buildComment(type, e, node)};
							}
						break;
					case "mouseover":
						if(inspectorData.options.recordHovers!="false"){
							interaction = {"event":type,"id":node.id,"comment":insp.buildComment(type, e, node)};
						}
						break;
					case "click":
					case "tap":
					case "mousedown":
                    case "mouseup":
                        lastInteraction = inspectorData.interactions[this.currentInteraction];
                        var hascls = node.className.length;
                        if (hascls > 0)
                            hasClassProp = true;
                        var hasID = false;
                        var hasIDProp = node.id.length;
                        if (hasIDProp > 0)
                            hasID = true;
                        var hasDataTestID = false;
                        if (node.getAttribute("data-testid") != null){
                            var dtIDProp = node.getAttribute("data-testid").length;
                            if (dtIDProp > 0)
                                hasDataTestID = true;
                        }
						//we can record these and ignore the hotkeys for playback mode
						if (node.id === "" && node.tagName === "LI"){
							var childNode = node.childNodes[0];
							var id = childNode.id;
							interaction = {"event":"click","id":id,"comment":insp.buildComment(type, e, node)};
						}
						else if (node.id=='' && hasClassProp && node.className.indexOf('maximo-lookup-drawer hover') > -1){
							var childNode = node.childNodes[4];
							var id = childNode.id;
							interaction = {"event":"click","id":id,"comment":insp.buildComment(type, e, node)};
						}
						else if (node.id== '' && hasClassProp && node.className.indexOf("maximo-checkbox") > -1){
							node = node.parentNode;
							node = node.parentNode;
							interaction = {"event":"click","id":node.id,"comment":insp.buildComment(type, e, node)};
						}
                        else if (node.id != '' && node.nodeName.toLowerCase().indexOf("svg") > -1) {
                            if (node.id.indexOf("tooltip") > 0) 
                                interaction = {"event":"click","id":node.id,"comment":"Click the tooltip icon"};
                            else if (node.id.indexOf("CheckBox") > 0)
                                interaction = {"event":"selectCheckbox","id":node.id,"comment":"Click the checkbox"};
                            else
                                interaction = {"event":"click","id":node.id,"comment":"Click the "+node.textContent+ " icon"};                       
                        }
                        else if (node.tagName.toLowerCase() === "textarea") {
                            var textareaLabel = node.parentNode.parentNode.previousSibling.childNodes[1].childNodes[0].textContent;
                            interaction = {"event":"click","id":node.id,"comment":"Click the "+textareaLabel+" textarea"};
                        }
                        else if (hasClassProp && node.className.indexOf("bx--list-box__menu-item") > -1){
                            var menuitem = node.textContent;
                            var dropdownNode = node.parentNode;
                            interaction = {"event":"clickDropdownItem","id":dropdownNode.id,"menuitem":menuitem,"comment":"Click the " +menuitem+ " menuitem"};
                        }
                        else if (hasClassProp && node.tagName.toLowerCase() === "li" && node.className.indexOf("mx--menu-item") > -1 && node.id !== "" && !node.id.startsWith("ApplicationRoutesMenu")){
                            var menuitem = node.textContent;
                            var dropdownNode = node.parentNode;
                            interaction = {"event":"clickDropdownItem","id":dropdownNode.id,"menuitem":menuitem,"comment":"Click the "+ node.textContent + " menuitem"}; 
                        }
                        else if (hasClassProp && node.className.indexOf("bx--form-item bx--checkbox-wrapper") > -1 && node.parentNode.className === "bx--list-box__menu-item__option"){
                            var menuitem = node.childNodes[1].title;
                            var dropdownNode = node.parentNode.parentNode.parentNode;
                            var parentNode = dropdownNode.parentNode.parentNode;
                            if (parentNode.id === '')
                                parentNode= dropdownNode.parentNode;
                            interaction = {"event":"clickDropdownSelectRowItem","id":parentNode.id,"menuitem":menuitem,"comment":"Click the " +menuitem+ " menuitem"};
                        }
                        else if (hasClassProp && node.className.indexOf("iot--progress-text-label") > -1){
                            var buttonNode = node.parentNode.parentNode;
                            var buttonID = buttonNode.getAttribute("data-testid");
                            interaction = {"event":"clickProgressWizardStep","buttonID":buttonID,"className":node.className,"comment":"Click the " +node.title+ " link"};
                        }
                        else if (hasClassProp && node.className.indexOf("iot--progress-step-button") > -1){
                            var buttonID = node.getAttribute("data-testid");
                            var stepNum = node.childNodes[1].childNodes[0].childNodes[2];
                            interaction = {"event":"clickProgressWizardStep","buttonID":buttonID,"comment":"Click the wizard icon"};
                        }
                        else if (hasClassProp && node.tagName.toLowerCase() === "input" && (node.className.indexOf("fld_question") > -1 || node.className.indexOf("fld_error") > -1 || node.className.indexOf("fld_warn") > -1)){
                            var newString = node.id.split("-");
                            var parentID = newString[0]+"-lb";
                            var parentNode = dom.byId(parentID);
                            var labelName = parentNode.innerText.replace(/:/g, "");
                            interaction = {"event":"clickFieldError","id":node.id,"comment":"Click the async image in the "+ labelName +" field"};
                        }
                        else if (hasClassProp && node.className === "maximo-toggle-button"){
                            var toggleLabel = node.getAttribute("aria-label");
                            interaction = {"event":"click","id":node.id,"comment":"Click the " + toggleLabel + " toggle"};
                        }
                        else if (!hasClassProp && node.tagName.toLowerCase() === "img" && !node.id.startsWith("toolactions") && !node.id.startsWith("ROUTE")){
                            var parentNode = node.parentNode;                     
                            var tableTitle = parentNode.parentNode.parentNode.childNodes[3].textContent;
                            interaction = {"event":"click","id":node.id,"comment":"Click the " + parentNode.title + " image in the " + tableTitle + " table"};
                        }
                        else if (hasClassProp && node.tagName.toLowerCase() === "img" && node.id.endsWith("ti_img") && node.id.indexOf("ttrow") === -1){
                            var parentNode = node.parentNode;
                            var tableTitle = parentNode.parentNode.parentNode.childNodes[3].textContent;
                            interaction = {"event":"click","id":node.id,"comment":"Click the " + parentNode.title + " image in the " + tableTitle + " table"};
                        }
                        else if (node.tagName == "MAXIMO-LABEL" && node.id == 'label'){
                            var childNode = node.childNodes[1];
                            var labelNode = node.childNodes[1];
                            if (labelNode.tagName != "LABEL")
                                labelNode = labelNode.childNodes[1];
                            var labelText = labelNode.innerText;
                            interaction = {"event":"click","id":childNode.id,"comment":"Click the "+labelText+ " label"};
                        }
                        else if (hasClassProp && node.tagName.toLowerCase() === "button" && node.id.indexOf("ync_") > -1)
                            interaction = {"event":"click","id":node.id,"comment":"Click the "+node.textContent+ " button in the dialog"};
                        else if (node.tagName == "MAXIMO-LABEL") {
                            var labelNode = node.childNodes[1];
                            if (labelNode.tagName != "LABEL")
                                labelNode = labelNode.childNodes[1];
                            var labelText = labelNode.innerText;
                            interaction = {"event":"click","id":node.id,"comment":"Click the "+labelText+ " label"};
                        }
                        else if (node.tagName.toLowerCase() === "a" && node.getAttribute("href").indexOf("gotolisttab") > -1){
                            var parentNode = node.parentNode.parentNode.parentNode;
                            interaction = {"event":"click","id":parentNode.id,"comment":"Click the "+node.textContent+ " link"};
                        }
                        else if (node.tagName == "svg" && hasID){
                            if (!node.id.contains("tooltip"))
                                interaction = {"event":"click","id":node.id,"comment":"Click the "+node.textContent+ " icon"};
                            else
                                interaction = {"event":"click","id":node.id,"comment":"Click the toolip icon"};
                        }
                        else if (hasClassProp && (node.className.indexOf("dataSetCard") > -1 || node.className.indexOf("cardcontainer") > -1)) {
                            node = node.parentNode;
                            interaction = {"event":"click","id":node.id,"comment":"Click the " + node.id + " tile"};
                        }
                        else if (node.tagName == "LABEL") {
                            if (node.id == "_label" && node.parentNode.tagName == "MAXIMO-LABEL")
                                interaction = {"event":"click","id":node.parentNode.id, "comment":"Click the "+node.title+ " label"};
                            else if (node.className === "bx--tile-content") 
                                interaction = {"event":"click","id":node.id, "comment":"Click the "+node.textContent+ " tile"};
                            else
                                interaction = {"event":"click","id":node.id,"comment":"Click the " + node.title + " label"};
                        }
                        else if (hasID && node.id == "techListCard_prioritytag_container")
                            interaction = {"event":"click","id":node.id,"comment":"Click the " + node.textContent + " label"};
						else if (node.id === "" && node.className === "" && node.nodeName === "DIV" && node.parentNode.parentNode.nodeName === "BUTTON"){
                            var parentNode = node.parentNode.parentNode;
                            interaction = {"event":"click","id":parentNode.id,"comment":insp.buildComment(type, e, node)};
                        }
                        else if (hasClassProp && node.className.indexOf("bx--toggle") > -1)
                            interaction = {"event":"click","id":node.id,"comment":"Click the " +node.parentNode.previousSibling.textContent + " toggle"};
                        else if (hasClassProp && node.className.indexOf("bx--dropdown") > -1)
                            interaction = {"event":"clickDropdown","id":node.id,"comment":"Click the dropdown"};
                        else if (hasClassProp && (node.className.indexOf("bx--multi-select bx--combo-box") > -1 && node.className.indexOf("bx--multi-select--filterable") === -1) || node.className === "bx--list-box__field"){
                            var parentNode = null;
                            if (node.className !== "bx--list-box__field"){
                                parentNode = node.parentNode;
                                if (parentNode.id === '')
                                    parentNode = node.parentNode.parentNode;
                                if (parentNode.id === '')
                                    parentNode = parentNode.parentNode;
                            }else{
                                parentNode = node.childNodes[0];
                                if (parentNode.className.indexOf("bx--list-box__field") === -1)
                                    parentNode = node.parentNode;
                            }
                            if (node.id !== '')
                                interaction = {"event":"clickDropdown","id":node.id,"comment":"Click the dropdown"};
                            else
                                interaction = {"event":"clickDropdown","id":parentNode.id,"comment":"Click the dropdown"};
                        }
                        else if (hasClassProp && node.className.indexOf("bx--multi-select bx--combo-box") > -1 && node.className.indexOf("bx--multi-select--filterable") > -1){
                            var inputNode = node.childNodes[0].childNodes[0];
                            interaction = {"event":"clickDropdown","id":inputNode.id,"comment":"Click the dropdown"};
                        }
                        else if (hasClassProp && node.className.indexOf("bx--select-input") > -1){
                            var footerSide = node.parentNode.parentNode.parentNode.parentNode.parentNode.className;
                            footerSide = footerSide.substring(16);
                            var tableClass = node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.className;
                            tableClass = tableClass.split(" ");
                            tableClass = tableClass[0];
                            interaction = {"event":"clickDropdown","id":tableClass,"footerSide":footerSide,"comment":"Click the dropdown"};
                        }
                        else if (hasClassProp && node.className.indexOf("bx--list-box__menu-icon") > -1){
                            var inputNode = node.parentNode.childNodes[0];
                            if (inputNode.tagName.toLowerCase() === "div")
                                inputNode = node.parentNode.childNodes[1];
                            interaction = {"event":"clickDropdownIcon","id":inputNode.id,"comment":"Click the "+node.title+" button in the dropdown"};
                        }
                        else if (node.nodeName.toLowerCase() === "button" && hasClassProp && node.className.indexOf("mx--button") > -1)
                            interaction = {"event":"click","id":node.id,"comment":"Click the " +node.textContent + " button"};
                        else if (node.nodeName.toLowerCase() === "div" && hasClassProp && node.className.indexOf("divider") > -1)
                            interaction = {"event":"click","id":node.id,"comment":"Click the " +node.textContent + " button"};
                        else if (node.nodeName.toLowerCase() === "div" && node.className === "bx--select-input__wrapper"){
                            var childNode = node.childNodes[0];
                            interaction = {"event":"click","id":childNode.id,"comment":"Click the dropdown"};
                        }
                        else if (node.getAttribute("data-testid") != null && node.nodeName.toLowerCase() === "a" && !(hasClassProp && node.className.indexOf("bx--header__menu-item") > -1) && !(!hasClassProp && node.getAttribute("data-testid").indexOf("suite-header-app-switcher") > -1))
                            interaction = {"event":"click","id":node.id,"comment":"Click the " +node.textContent + " link"};
                        else if (node.id === "" && node.className === "bx--form-item bx--checkbox-wrapper")
                            interaction = {"event":"click","id":node.childNodes[0].id,"comment":"Click the Select Row checkbox"};
                        else if (iconName !== null && node.parentNode.className.indexOf("cards_search_searchInput-search") === -1){
                            var tableClass = node.className;
                            if (tableClass === "")
                                tableClass = node.parentNode.className;
                            tableClass = tableClass.split(" ");
                            tableClass = tableClass[0];
                            interaction = {"event":"clickTableHeaderButton","tableClass":tableClass,"button":iconName,"comment":"Click the "+iconName+" button"};
                        }
                        else if (node.nodeName.toLowerCase() === "svg" && node.parentNode.parentNode.parentNode.className.indexOf("bx--list-box__") > -1){
                            parentNode = node.parentNode.parentNode.parentNode;
                            interaction = {"event":"clickMultiselectDropdownClearSelectionIcon","id":parentNode.id,"comment":"Click the Clear Selection icon"};
                         }
                        else if (node.tagName.toLowerCase() === "button" && (node.className.indexOf("down-icon") > -1|| node.className.indexOf("up-icon") > -1)){
                            var button = null;
                            if (node.className.indexOf("down-icon") > -1)
                                button = "decrement";
                            else if (node.className.indexOf("up-icon") > -1)
                                button = "increment";
                            node = node.parentNode.parentNode.firstChild;
                            interaction = {"event":"clickDecrementOrIncrementButton","id":node.id,"button":button,"comment":"Click the "+button+" button"};
                        }
                        else if (hasClassProp && node.className.indexOf("bx--btn bx--btn--") > -1 && node.parentNode.parentNode.className.indexOf("bx--modal-container") > -1){
                            var parentID = node.parentNode.parentNode.parentNode.id;
                            if (parentID == ""){
                                parentID = node.getAttribute("data-testid");
                                interaction = {"event":"clickDialogButton","data-testid":parentID,"comment": insp.buildComment(type, e, node)};
                            }
                            else
                                interaction = {"event":"clickDialogButton","id":parentID,"className":node.className,"comment": insp.buildComment(type, e, node)};
                            }
                        else if (hasClassProp && node.className.indexOf("bx--pagination__button--backward") > -1){
                            var parentClass = node.parentNode.parentNode.parentNode.className;
                            parentClass = parentClass.split(" ");
                            parentClass = parentClass[0];
                            interaction = {"event":"clickTableBackButton","id":parentClass,"comment":"Click the back button in the table"};
                        }
                        else if (hasClassProp && node.className.indexOf("iot--tableheader-filter") > -1){
                             interaction = {"event":"clickClearFilterImage","data-column":node.getAttribute("data-column"),"comment":"Click the Clear Filter image for the filter field"};
                        }
                        else if (hasClassProp && node.className.indexOf("bx--pagination__button--forward") > -1){
                            var parentClass = node.parentNode.parentNode.parentNode.className;
                            parentClass = parentClass.split(" ");
                            parentClass = parentClass[0];
                            interaction = {"event":"clickTableForwardButton","id":parentClass,"comment":"Click the forward button in the table"};
                        }
                        else if (hasClassProp && node.className.indexOf("column-header__btn") > -1)
                            interaction = {"event":"clickTableHeaderColumnButton","id":node.className,"buttonName":node.textContent,"comment":"Click the " +node.textContent +" column header button in the table"};  
                        else if (hasClassProp && node.nodeName.toLowerCase() === "button" && node.className === "bx--table-expand__button"){
                            var tableClass = node.parentNode.parentNode.parentNode.parentNode.parentNode.className;
                            tableClass = tableClass.split(" ");
                            tableClass = tableClass[0];
                            var colID = node.parentNode.nextSibling.id;
                            interaction = {"event":"clickTableRowExpandCollapseButton","tableClass":tableClass,"id":colID,"comment":"Click the expand/collapse button in the table row"};
                        }
                        else if (hasClassProp && node.className.indexOf("bx--btn bx--btn--ghost") && hasDataTestID){
                            var divClass = node.parentNode.className;
                            var dataTestID = node.getAttribute("data-testid");
                            var buttonName = node.textContent;
                            if (buttonName == '')
                                buttonName = node.title;
                            interaction = {"event":"clickTableRowButton","divClass":divClass,"data-testid":dataTestID,"comment":"Click the "+buttonName+" button in the table row"};
                           
                        }
                        else if (hasClassProp && node.className.indexOf("bx--btn bx--btn--ghost") > -1){
                            var divClass = node.parentNode.className;
                            var buttonName = node.textContent;
                            if (buttonName == '')
                                buttonName = node.title;
                            interaction = {"event":"clickTableRowButton","divClass":divClass,"button":buttonName,"comment":"Click the "+buttonName+" button in the table row"};
                        }
                        else if (hasClassProp && node.className.indexOf("bx--form-item") > -1 && node.childNodes[0] != null && node.childNodes[0].className.indexOf("bx--label") > -1 && node.childNodes[0].nextElementSibling.childNodes[0] != null && node.childNodes[0].nextElementSibling.childNodes[0].tagName.toLowerCase() === "input"){
                            var input = node.childNodes[0].nextElementSibling.childNodes[0];
                            interaction = {"event":"click","id":input.id,"comment":"Click the "+node.childNodes[0].textContent+" field"};
                        }
                        else if (hasClassProp && node.className.indexOf("bx--form-item") > -1 && node.firstChild.className.indexOf("bx--number bx--number--helpertext") > -1 && node.firstChild.lastChild.firstChild.nextSibling.tagName.toLowerCase() === "input"){
                            var input = node.firstChild.lastChild.firstChild.nextSibling;
                            interaction = {"event":"click","id":input.id,"comment":"Click the "+node.firstChild.firstChild.textContent+" field"};
                        }
                        else if (hasClassProp && node.tagName.toLowerCase() === "button" && node.className.indexOf("bx--btn bx--btn--primary") > -1 && node.parentNode.className === "bx--action-list"){
                            var divClass = node.parentNode.parentNode.parentNode.parentNode.className;
                            divClass = divClass.split(" ");
                            divClass = divClass[0];
                            interaction = {"event":"clickTableActionButton","id":divClass,"buttonName":node.textContent,"comment":"Click the "+node.textContent+" button"}; 
                        }
                        else if (node.className === "bx--form-item" && node.parentNode.className === "mx--toggle bx--form-item"){
                            var input = node.childNodes[0];
                            var tc = node.childNodes[1].childNodes[0].childNodes[0].childNodes[0];
                            if (tc != undefined)
                                tc = true;
                            var text = null;
                            if (tc)
                                text = node.childNodes[1].childNodes[0].childNodes[0].childNodes[0].textContent;
                            else
                                text = node.childNodes[1].innerText;
                            lastInteraction = inspectorData.interactions[this.currentInteraction];
                            var comment = "Click the "+text+" toggle";
                            if (!(lastInteraction !== undefined && lastInteraction.event === "clickToggle" && lastInteraction.id === input.id && ((currentTimeStamp - lastTimeStamp) < 75) && ((currentTimeStamp - lastTimeStamp) > 5)))
                                interaction = {"event":"clickToggle","id":input.id,"comment":comment}; 
                        }
                        else if (node.tagName.toLowerCase() === "svg" && node.parentNode.className.indexOf("bx--tooltip__label") > -1)
                            interaction = {"event":"click","id":node.parentNode.id,"comment":"Click the icon on the tile"};
                        else if (!hasClassProp && node.tagName.toLowerCase() === "svg" && node.parentNode.className === "bx--modal-close")
                            interaction = {"event":"clickDialogButton","id":node.parentNode.parentNode.parentNode.parentNode.id,"className":node.parentNode.className,"comment":"Click the close icon on the dialog"};
                        else if (node.tagName.toLowerCase() === "button" && node.className === "bx--modal-close")
                            interaction = {"event":"clickDialogButton","id":node.parentNode.parentNode.parentNode.id,"className":node.className,"comment":"Click the close icon on the dialog"};
                        else if (node.id === '' && hasClassProp && (node.className.indexOf("bx--header-action-btn") > -1 || node.className.indexOf("bx--header__menu-item") > -1)){
                            var arialabel = node.getAttribute("aria-label");
                            interaction = {"event":"clickNavigationButton","className":node.className,"ariaLabel":arialabel,"comment":"Click the "+arialabel+" navigation button"};
                        }
                        else if (!hasID && node.tagName.toLowerCase() === "a" && node.getAttribute("data-testid") != null && node.getAttribute("data-testid").indexOf("suite-header-app-switcher") > -1)
                            interaction = {"event":"clickAppLink","dataTestID":node.getAttribute("data-testid"),"comment":"Click the "+node.textContent+" link"};
                        else if (hasClassProp && node.tagName.toLowerCase() === "button" && node.className.indexOf("bx--side-nav__link") > -1 && node.parentNode.className == "bx--side-nav__item")
                            interaction = {"event":"clickSideNavigationItem","title":node.title,"comment":"Click the "+node.title+" menuitem"};
                        else if (hasClassProp && node.tagName.toLowerCase() === "button" && node.className.indexOf("bx--side-nav__submenu") > -1) {
                            if (node.parentNode.className.indexOf("side-nav__item--depth-0") > -1){
                                var textNode = node.childNodes[1];
                                interaction = {"event":"clickSideNavigationMenu","text":textNode.textContent,"comment":"Click the "+textNode.textContent+" menuitem"};
                            }
                            else if (node.parentNode.className.indexOf("side-nav__item--depth-1") > -1){
                                var textNode = node.childNodes[0];
                                var parentMenu = node.parentNode.parentNode.parentNode.childNodes[0].childNodes[1];
                                interaction = {"event":"clickSideNavigationSubMenu","text":textNode.textContent,"parentMenu":parentMenu.textContent,"comment":"Click the "+textNode.textContent+" menuitem"};
                            }
                        }
                        else if (hasClassProp && node.className == "bx--side-nav__link" && node.parentNode.className === "bx--side-nav__menu-item"){
                            var textNode = node.childNodes[0];
                            var parentMenu = node.parentNode.parentNode.parentNode;
                            if (parentMenu.className.indexOf("side-nav__item--depth-1") > -1){
                                var subMenu = parentMenu.childNodes[0].childNodes[0];
                                parentMenu = subMenu.parentNode.parentNode.parentNode.parentNode.childNodes[0].childNodes[1];
                                interaction = {"event":"clickSideNavigationApplication","text":textNode.textContent,"subMenu":subMenu.textContent,"parentMenu":parentMenu.textContent,"comment":"Click the "+textNode.textContent+" menuitem"};
                            }
                            else {
                                parentMenu = node.parentNode.parentNode.parentNode.childNodes[0].childNodes[1];
                                interaction = {"event":"clickSideNavigationApplication","text":textNode.textContent,"parentMenu":parentMenu.textContent,"comment":"Click the "+textNode.textContent+" menuitem"};
                            }                           
                        }
                        else if (hasClassProp && node.className.indexOf("flatpickr-day") > -1)
                            interaction = {"event":"clickDatePickerDay","day":node.textContent,"comment":"Click the number "+node.textContent};
                        else if (hasClassProp && node.tagName.toLowerCase() === "input" && (node.className.indexOf("bx--date-picker__input") > -1 || node.className.indexOf("bx--time-picker__input-field") > -1)){
                            var parentNode = node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
                            var parentText = parentNode.textContent;
                            if (parentText === '' || parentText.indexOf("AMPM") > -1)
                                parentText = parentNode.parentNode.parentNode.parentNode.childNodes[0].textContent;
                            var type = null;
                            if (node.className.indexOf("bx--time-picker__input-field") > -1)
                                type = "time";
                            else
                                type = "date";
                            interaction = {"event":"click","id":node.id,"comment":"Click the "+parentText+" " + type +" field"};
                        }
                         else if (hasClassProp && node.id === '' && (node.className === "arrowUp" || node.className === "arrowDown")){
                            var comment = null;
                            if (node.className === "arrowUp")
                                comment = "Click the up arrow for the year in the date picker";
                            else
                                comment = "Click the down arrow for the year in the date picker";
                            this.addInteraction(e, {"event":"clickDatePickerYearArrow","arrow":node.className,"comment":comment});
                            insp.addInspectionPoints();
                        }
                        else if (hasClassProp && node.id === '' && (node.className === "flatpickr-prev-month" || node.className === "flatpickr-next-month")){
                            var comment = null;
                            if (node.className === "flatpickr-prev-month")
                                comment = "Click the previous arrow for the month in the date picker";
                            else
                                comment = "Click the next arrow for the month in the date picker";
                            this.addInteraction(e, {"event":"clickDatePickerMonthArrow","arrow":node.className,"comment":comment});
                        }
                        else if (hasClassProp && node.id === '' && node.className.indexOf("bx--header__menu-toggle") > -1)
                            this.addInteraction(e, {"event":"clickApplicationMenuButton","comment":"Click the application menu button"});
                        else if (hasClassProp && node.className === "bx--search-input")
                            this.addInteraction(e, {"event":"click","id":node.id,"comment":"Click the "+node.getAttribute("placeholder") + " field"});
                        else if (hasClassProp && node.id !== "" && node.className.indexOf("bx--text-input") > -1){
                            var label = null;
                            var hassibling = node.parentNode.parentNode.previousSibling;
                            if (hassibling != null)
                                label = node.parentNode.parentNode.previousSibling.textContent;
                            else
                                label = "";
                            this.addInteraction(e, {"event":"click","id":node.id,"comment":"Click the "+label +" field"});                                
                        }
                        else if (hasClassProp && node.tagName.toLowerCase() === "input" && node.type === "radio"){
                            var labelNode = node.parentNode.nextElementSibling;
                            this.addInteraction(e, {"event":"click","id":node.id,"comment":"Click the "+labelNode.textContent +" radio button"});
                        }
                        else if (hasClassProp && node.tagName.toLowerCase() === "button" && node.type === "submit" && node.parentNode.parentNode.parentNode.parentNode.tagName.toLowerCase() === "table" ){
                            var tableNode = node.parentNode.parentNode.parentNode.parentNode;
                            var textNode = tableNode.childNodes[1].childNodes[0].childNodes[3];
                            this.addInteraction(e, {"event":"click","id":node.id,"comment":"Click the "+node.textContent +" button in the " +textNode.textContent+" table"});
                        }
                        else
 							interaction = {"event":"click","id":node.id,"comment": insp.buildComment(type, e, node)};
						break;
					case "tap.hold":
						if (node.id.indexOf("GroupItem") > 1)
							break;
						else
						{	
						if(this.holdAllowed(node))
							interaction = {"event":"longpress","id":node.id,"comment":insp.buildComment(type, e, node)};
						break;
						}
					default:
						break;
				}
			}
			interaction = this.getCustomInteraction(e, node, interaction);
			if(interaction){
				this.addInteraction(e, interaction);
 				if(e){
					e.recorded = true;
				}
			}
		}
		lastTimeStamp = currentTimeStamp;
		console.log("currentTimeStamp:" +currentTimeStamp);
		console.log("lastTimeStamp:" +lastTimeStamp);
		return node;
	},
	holdAllowed: function(node){
		return true;
	},
	getCustomInteraction: function(e, node, interaction){
		//designed for override only
		//allow extensions to add custom checks on top of defaults or override them completely
		return interaction;
	},
	buildComment: function(eventtype, e, node){
		try{
			return this.getComment(eventtype, e, node);
		}
		catch(error){
			return e.type + " " +node.id;
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
	addCustomInspectionPoint: function(){
		//override this to allow custom additions. Return should be an array of strings with names of events
		return null;
	},
	addInspectionPoint: function(node, interactionElement){
		var insp = this;
		var boundEvents;
		var boundEventsStr = attr.get(node, "inspectorEvents");
		if(boundEventsStr){
			boundEvents = JSON.parse(boundEventsStr);
		}
		if(!boundEvents){
			boundEvents = [];
		}
		var href = node.href;
		if(href){
			href = href.toLowerCase();
		}

		if(insp.addCustomInspectionPoint){
			var added = insp.addCustomInspectionPoint(node, boundEvents);
			if(added){
				if(typeof added == "boolean"){
					return;
				}
				else if(added.length>0){
					boundEvents = boundEvents.concat(added);
					attr.set(node, "inspectorEvents", JSON.stringify(boundEvents));
					return;
				}
			}
		}
	
		var events = interactionElement.events;

		array.forEach(events, function(event){
			var addInfo = insp.getAddInfo(event, node);
			if(addInfo.addIt && array.indexOf(boundEvents, addInfo.eventType)==-1){
				onEvent(node, event, function(e){
					if(!inspectorData.recording || e.recorded){
						return;
					}
					insp.recordInteraction(e);
				});
				boundEvents.push(addInfo.eventType);
				attr.set(node, "inspectorEvents", JSON.stringify(boundEvents));
			}
		});
	},
	shiftInteraction: function(e, interaction){
		return 0;
	},
	getAddInfo: function(event, node){
		var insp = this;
		var addIt = true;
		var eventType;
		switch(event){
			case touch.press:
				addIt = insp.hasMouseEvents(node);
				eventType = "touch.press";
				break;
			case tap:
				eventType = "tap";
				break;
			case tap.hold:
				addIt = insp.hasMouseEvents(node);
				eventType = "tap.doubletap";
				break;
			case tap.doubletap:
				addIt = insp.hasMouseEvents(node);
				eventType = "tap.hold";
				break;
			case "click":
				addIt = insp.hasMouseEvents(node);
				eventType = "click";
				break;
			case "keypress":
			case "keydown":
				if(node.nodeName==='LI' || attr.get(node, "tabindex")!="-1"){
					addIt = insp.hasKeyboardEvents(node);
					eventType = event;
				}
				break;
			default:
				eventType = event;
				addIt = true;
				break;
		}
		return {"eventType":eventType, "addIt":addIt};//, "shift":shift};
	},
	isVisible: function(node){
		return style.get(node, "display") !="none" && style.get(node, "visibility") != "hidden"; 
	},
	hasKeyboardEvents: function(node){
		return node.onkeypress || node.onkeydown || node.onkeyup;
	},
	hasMouseEvents: function(node){
		if(attr.get(node, "mouseEvents")=="true"){
			return true;
		}
			
		switch(node.tagName){
			case "A":
				var href = attr.get(node, "href");
				if(!href){
					return false;
				}
				return href.trim().length>0 && href.indexOf("void(0)")==-1;
			case "BUTTON": //always allow mouse events on buttons
				return true;
		}
		return node.onclick || node.onmousedown || node.onmouseup || node.onmouseover || node.onmouseenter;
	},
	updateParams: function(str, params){
		if(typeof params == "string"){
			str = str.replace("{0}", params);
		}
		else {
			array.forEach(params, function(param, index){
				str = str.replace("{"+index+"}", param);
			});
		}
		return str;
	},
	log: function(text, level){ // null: no color, 0:green, 1: orange, 2: red
		var logColors = { null:"color:black",0:"color:blue",1:"color:green",2:"color:orange",3:"color:red",4:"color:green;background:#e7e7e7"};
		var indent = "";
		switch(level){
			case 0:
			case 3:
				indent = "\t";
				break;
			case 2:
				indent = "\t\t";
				break;
			case 1:
			case null:
				break;
			default:
				break;
		}
		console.info(("%c"+indent+text), logColors[level]);
	},
	centerDialogOnParent: function(dialog, parent){
		var top = (parseInt(parent.domNode.style.top, 10) + parent.domNode.offsetHeight/2) - dialog.domNode.offsetHeight/2;
		var left = (parseInt(parent.domNode.style.left, 10) + parent.domNode.offsetWidth/2) - dialog.domNode.offsetWidth/2;
		style.set(dialog.domNode, {"left":(left>=0?left:0)+"px", "top":(top>=0?top:0)+"px"});
	},
	setButtonEnabled: function(button, enabled){
		var disabled = !enabled;
		var buttonDisabled = attr.get(button, "disabled")?attr.get(button, "disabled"):"false";
		if(buttonDisabled != disabled){
			style.set(button, "opacity", (disabled?0.3:1));
			attr.set(button, "disabled", disabled);
		}
	},
	processSimpleDialogButtons: function(dialog){
		var insp = this;
		if(!dialog){
			return;
		}
		var buttons = query("button", dialog.domNode);
		array.forEach(buttons, function(button){
			var method = attr.get(button, "data-method");
			var arg = attr.get(button, "data-arg");
			if(method){
				style.set(button, {"display":""});	
				onEvent(button, "click", function(e){
					dialog.showWait();
					window.setTimeout(function(){
						if(method=="cancel"){
							registry.byId(dialog.id).hide();
						}
						else {
							insp[method].apply(insp, arg);
						}
						dialog.hideWait();
					}, 10);
				});
			}
		});
	},
	addClearFields: function(node){
		var insp = this;
		var fields = query("INPUT[type='text']", node);
		array.forEach(fields, function(field){
			if(!attr.get(field, "readonly")){
				onEvent(field, "mousemove, focus, keypress", function(e){
					if(this.value.length>0){
						var cursor = "text";
						var image = insp.resources.images.clear_field;
						if(e.offsetX>(this.offsetWidth-18)){
							cursor = "default";
							image = insp.resources.images.clear_field_hover;
						}
						style.set(field, {"background-image":"url("+image+")","background-repeat":"no-repeat","background-position":"right center","cursor":cursor});
					}
					else {
						onEvent.emit(this, "mouseout", {});
					}
				});
				onEvent(field, "keyup", function(e){
					if(e.keyCode==46 && e.ctrlKey){
						this.value = "";
						style.set(field, {"background":""});
					}
					if(this.value === ""){
						onEvent.emit(this, "mouseout", {});	
					}
				});
				onEvent(field, "change", function(e){
					onEvent.emit(this, "mouseout", {});
				});
				onEvent(field, "mouseout", function(){
					style.set(field, {"background":""});
				});
				onEvent(field, "click", function(e){
					if(e.offsetX>(this.offsetWidth-18)){
						this.value = "";
						style.set(field, {"background":""});
					}
				});
			}
		});
	},
	//Should be only called in context of a dialog
    showWait: function(){
		var pos = geom.position(this.domNode);
		var wait = document.createElement("iframe");
		style.set(wait, {"id":this.id+"_wait","position":"absolute","cursor":"wait","background":"rgba(0,0,0,.0)","border":"0px","left":pos.x+"px","top":(pos.y+5)+"px","width":pos.w+"px","height":(pos.h+5)+"px","zIndex":parseInt(this.domNode.style.zIndex)+1,"display":"none"});
		this.domNode.parentNode.appendChild(wait);
		style.set(wait, {"display":"block"});
		style.set(wait.contentWindow.document.body, {"cursor":"wait"});
		this.wait = wait;
	},
	hideWait: function(){
		var dialog = this;
		style.set(this.wait.contentWindow.document.body, {"cursor":""});
		window.setTimeout(function(){
			if(dialog.wait){
				dialog.wait.parentNode.removeChild(dialog.wait);
				dialog.wait = null;
			}
		}, 100);
	}
  });
});