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
/*jshint maxlen:false */
/*jshint loopfunc:true */
define([
  'dojo/_base/declare',
  'dojo/query',
  'dojo/dom-attr',
  'dojo/_base/lang',
  'dojo/dom-style',
  'dojo/_base/array',
  'dojo/on',
  'dijit/registry',
  'dojo/dom',
  'dojo/_base/window',
  'dojo/dom-geometry',
  'dijit/TooltipDialog',
  'dojo/aspect',
  'dijit/Dialog',
  'dojo/dom-class',
  'dojo/topic',
  (window.inspectorBaseUrl ||
    JSON.parse(localStorage.getItem('tpaeInspectorData')).baseURL) +
    '/Inspector.js',
], function (
  declare,
  query,
  attr,
  lang,
  style,
  array,
  onEvent,
  registry,
  dom,
  win,
  geom,
  TooltipDialog,
  aspect,
  Dialog,
  domClass,
  topic,
  Inspector
) {
  return declare([Inspector], {
    bindMethods: [
      { method: 'bindEventsArray' },
      { method: 'fillNavSection' },
      {
        method: 'showCommonTooltipDialog',
        elementId: 'tt',
        ignoreCheck: 'true',
      },
      { method: 'hideShowElement' },
      { method: 'showMessage', elementId: 'titlebar_error_table' },
    ],
    markerEvents: [
      'maintabchange',
      'subtabchange',
      'showdialog',
      'hidedialog',
      'changeapp',
    ],
    deepAssertionAttributes: {
      all: [
        'id',
        'class',
        'role',
        'style',
        'tabIndex',
        'title',
        'display',
        'aria-label',
        'aria-labelledby',
        'aria-hidden',
      ],
      a: ['href', 'textContent'],
      input: ['value', 'fldInfo'],
      img: ['src'],
      div: ['innerHTML', 'innerText'],
      span: ['innerHTML', 'textContent'],
      td: ['innerHTML', 'textContent'],
      button: ['textContent'],
      th: ['textContent'],
    },
    minWait: 1000,
    minWaitAttempts: 3,
    dataId: 'tpaeInspectorData',
    fieldErrorClick: false,
    constructor: function () {
        var iframeDocument = window.document;
        var iframebody = iframeDocument.getElementsByTagName('body')[0];
        var iframe = document.getElementById('manage-shell_Iframe');
        if (iframe) {
            iframeDocument =
                iframe.contentDocument || iframe.contentWindow.document;
        iframebody = iframeDocument.getElementsByTagName('body')[0];
      }

      var config = { attributes: false, childList: true, subtree: true };

      // Callback function to execute when mutations are observed
      var callback = function (mutationsList, observer) {
        for (var mutation of mutationsList) {
          if (mutation.type == 'childList') {
            console.log('A child node has been added or removed.', mutation);
            if (!inspectorDialog.domNode) {
              observer.disconnect();
              continue;
            }
            insp.addInspectionPoints(iframebody);
          }
        }

        config = { childList: true };
        var callback = function (mutationsList, observer) {
          for (let mutation of mutations) {
            if (mutation.type === 'childList')
              console.log('A child node has been added or removed.', mutation);
            insp.addInspectionPoints(iframebody);
          }
        };
        observer.observe(iframebody, config);
      };

      // Create an observer instance linked to the callback function
      var observer = new MutationObserver(callback);

      // Start observing the target node for configured mutations
      observer.observe(iframeDocument, config);

      this.resources.strings.verify_message = 'Verify Titlebar Message';
      this.resources.strings.get_titlebar_message = 'Get Titlebar Message';
      this.resources.strings.titlebar_message = 'Titlebar Message';
      this.resources.strings.get_system_message = 'Get System Message';
      this.resources.strings.system_message = 'System Message';
      this.resources.strings.set_go_to_app = 'Set gotoApp';
      this.resources.strings.set_checkbox_state = 'Set Checkbox State';
      this.resources.strings.click_submit_and_open_report =
        'Click Submit and Open Report';
      this.resources.strings.click_submit_success = "Submit click added to position";
      this.resources.strings.interaction_node = 'Interaction Node';
      this.resources.strings.action_click = 'Click';
      this.resources.strings.action_type = 'Type';
      this.resources.strings.application = 'Application';
      this.resources.strings.checkbox_state = 'Checkbox State';
      this.resources.strings.checked = 'Checked';
      this.resources.strings.unchecked = 'Unchecked';
      this.resources.strings.assert_sql = 'Assert SQL Value';
      this.resources.strings.checkbox_added_success =
        'Checkbox state added to position';
      this.resources.strings.checkbox_state_added =
        "Checkbox state selection was created for node '{0}'";
      this.resources.strings.assert_true = 'Added Assert True SQL Statement';
      this.resources.strings.assert_false = 'Added Assert False SQL Statement';
      this.resources.strings.dates = 'Generate Date/time Typeover';
      this.resources.strings.dates_message = 'Date/Time typeover added';
      this.resources.strings.classify_asset = 'Classify';
      this.resources.strings.add_classification =
        "Classification added for node '{0}'";
      this.resources.strings.params_field = 'Params';
      this.resources.strings.clear_text_added_success =
        'Clear text interaction added to position';
      this.resources.strings.table_find_help =
        "<ul style='padding: 5px 20px; border: 0px !important;'><li>Choose a table to search</li><li>If you click a data row, the values will be pre-filled</li><li>Enter a variable name (length>" +
        this.minVariableNameLength +
        ') </li><li>Modify values as desired using valid sql<br><small>CTRL+DEL or click X to clear value</small></li><li>Click the + button to add the search</li></ul>';
      this.interactionElements = this.interactionElements.concat([
        {
          query: '*[ctype]',
          events: ['click', 'change', 'keypress', 'keydown'],
        },
        { query: '*[tablecell]', events: ['click', 'keypress'] },
        { query: 'SPAN', events: ['click', 'keypress'] },
        { query: 'IMG', events: ['click', 'keypress'] },
        { query: 'PATH', events: ['click', 'keypress'] },
        { query: 'A', events: ['click', 'keypress'] },
        {
          query: 'TEXTAREA',
          events: ['click', 'change', 'keypress', 'keydown'],
        },
      ]);
      var insp = this;
      var iframedoc = window.document;
      this.extendedButtons = [
        {
          label: this.resources.strings.verify_message,
          method: 'verifyMessage',
          enabledCheck: function () {
            return (
              iframedoc.getElementById('titlebar_error').innerHTML != '&nbsp;'
            );
          },
          image:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAMAAABhEH5lAAAAB3RJTUUH3gwKEgUDtXEIewAAAAlwSFlzAAALEgAACxIB0t1+/AAAAARnQU1BAACxjwv8YQUAAAAqUExURQAAABBSnBBKlBBKjFqt1lKt1kqcxjml1jGUvQhapXO11tbn75S93ghzrVeLrzsAAAABdFJOUwBA5thmAAAAZ0lEQVR42o3QSw6AIAxFUcHXD0X3v12LVEFH3OFJWxK2bbEzKl5KnY7IDDyTAcw6k9XKX7JGqkovWTujKoOa1KoiElTaU/QjgKQTciefkZtIEFPm8lCfSmAn0Wkx+SlEFDTKeV/9rAtA9QWe/7wCPwAAAABJRU5ErkJggg==',
        },
        {
          label: this.resources.strings.assert_sql,
          method: 'assertSql',
          image:
            'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAIAAADZrBkAAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABYSURBVDhPY/hPFhjVhgEIa7s9wYrBasJtKA8KYNpAkmAAUrEtDcJmYEjbhlcbWCFQDYwNYkJpvLbB7bOaMIF4bSjOQnCIsA0DwByLDeDRhg+MakMD//8DAASycOEOHB5WAAAAAElFTkSuQmCC',
        },
        {
          label: this.resources.strings.get_titlebar_message,
          method: 'getTitlebarMessage',
          enabledCheck: function () {
            return (
              iframedoc.getElementById('titlebar_error').innerHTML != '&nbsp;'
            );
          },
          image:
            'data:image/png;base64,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',
        },
        {
          label: this.resources.strings.get_system_message,
          method: 'getSystemMessage',
        enabledCheck: function () {
            return (
              iframedoc.getElementById('mb_msg') != null
            );
          },
          image:
            'data:image/png;base64,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',
        },
        {
          label: this.resources.strings.set_go_to_app,
          method: 'setGotoApp',
          image:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAH6CAMAAACgQg0rAAADAFBMVEUAAAD6+/r9/v39/v0ZTh0bViAVRhkTSBcdXSGFoYcLPw4TRRcfYSMcXCAXShu0x7Zafl0bVx8nXit9m3+lu6dvkXGuwbAuZTFhh2OJo4sAJQBUgFdAdENEeUgAJgC1yLZSflQ5bTypvKu1xraguaIPQRNQelJ7nX1bil4QQRQNQxFUfFZhkGOIqIoWWBsPQRNWelh/ooIFTAkLTg8QQhRUfFY9cEAOURMVUBktYDABRwReimFhiWQUTxgANABXe1lDckaOqJA0tjIlpiMwsi82uDQvsCwkpCAhoR4ZWx03uTYSRRYioh8nqCQTSRcztDEyszAfnxw8vTsvsS0rrysmqCQlpSIpqic6vDktrisRQhUUSxgjpSEenRognxwqqyg5uzksrSo5vjwnqSUiox8prSk6vz4tsiw5ujg8wEEoqycZWh0rrCkgoB0pqSYurys4vTs1ujgaXR4nqiYwsy8SggQWVBoVjwU0ujYVTxkxtjI7wEAdnBkprCgWURoXmQc2vDklqCQQfAIQeQISRxYRfQIyuDMYWRwXVxsvtDA7vz82uzkUiwUXmAcusy4ShAMwtTERgAMkpyIzuDUenBkkpiIUTRgThwQVkwYWlQYTiQUQdwIQeAIrrCg9wUIUjQUcmhgWlgcorCc0uDURRBUVkQUZVSADTAgSaAwYjhA9wkIVhgoUlwQYXRwTkQEVaBIAMQAWoAQSPRgSigEQgQAcmRYSjQITQRoTlAE+vz0ALQATRBkAKwBAxEQRQRUTkAIaXx4RiAEeYCIXahQURRsWnAUAQgARhgATVhQAQAAZUh8WngQWmQUWTRsWSxwVlgQPfwASSxYAOwASUxMVRxoViQoWkAgOcgAWogQXWxsYUB4KQA4NdAAPfgAAJwAWjAwSZA0APQAOdQARgwAcWiAROxgSbQsXbRQSPxgRNxcARwEUgQkTeAgVcw8ROBcSURMYkwoUfgoUhAkVeg0OdgAbmw8alQ8oqiAXZBcjphoJTw0IPAwfoRUSTBUTWxITYBAvo/ikAAAAQnRSTlMABAEC+/78/f166f37/vsOT/u/JxUyRrY/HPGNpp35I5iuUzkz5H1QivXKcoRB1NasXuzgvWeL2saf9G5i8O5cxmxSpSB8AABE1ElEQVR42uzcP2gTYRzG8UuOQIcLEREdNMQ/QR000AgqdhE63W6cdKpZzJbg6OCFI52EE906dbhQJGSJe7hCbDoVSoeCUmiKwqmLiJQM4ptLr7/L5XKm7d2b1j7f6SCQIfnwvORIIqBjmigKYvrWhXvSlJRJ3kgIYkRAiFuiINzOmNWVZq91M3tdEKICQmFH/s62/hiSYQGUjFo1e1uIgiDiU1QQs+uS1KSkWnsGI4j4xJzdX7H4UYbRugWBiEsRYca0/VEQiPjEkD0oNpsQiCZTRLjBBhACEecI4KWuG2CxFwQiDjFgdzYNl70iBCJORQXRNJz2IBDxLCKkTGPPHgQibhHAa6ZUHBkEonAigOcZQAhEnCOAZxhACEQTiBYQAtEEIoAQiHhHAFtSEQLRBCKAEIgmEAGEQDSBCCAEIt7RjWgGEALRePEHSAJvQiDiAnD36w4EIs94ANxpdpZjEIi84gKw2GhAIAo7AmgMOpOLnzUIRCFHAM1hgKoKgcg7HguoqhCI+BQRUh4AIRBxiAC6UiEQeccFYFzVIBB5xgsgNhDxSfQAuMMAQiDyihtAf4FtCEQhAlQYQGwg8ognQG+BshUEoqAAnvMBSALJHgQiTgBJoNwPAhEXgGULIAms6xCIKG4ASaD3Bl6EQBQGwO+aCoGIS6KQcAGU5WGACgQiKjSAspUXQGwgosIAKFsRQAhEoUcAZZY/QAhE1AQAjhbYhkAULkB/gVMQiIIFGPMGyAQux2oQiCYDEBuIKM4ASeByrACBKGyAHYc7+wIbiFh8ADbUfgtbv7dtgBCIKD4AtYWN10u/IBA54rqA5ff5vC1QgUAk8AeYswUqJHAZAhE3gHMQiCj+APcFKhCIJgHQFqhAIAoDYNuQRwL8mc8dTOBlCETBAiSBir/AAgsCUdAASaAyUmDBCgJR4AAXc74CbXsQiEIFyPIQWI8xcRCIwgP4jQEkgdvKkEAZAtHRAJ4bF+ArJhAbiLgCfOEECIEoBIApH4DKt+c5CEQUJ4CaDfDFAEAIREEX8QKojADIegmBKGyA9O9YZTdAEkhBIDoKwPQQwIIyGuAsBKJgAV5zAixYqaOP4FkIREEDlMieVWwIIAmchUAU+AK65fgAtAQuQiAKDOD5tjTIprLjD5AFgcej6MnPC2BhzRfgqA3UKy5+lUoFAgP2JooRO/G/eF0JoKM11Qb4c9EF0Fegw54VBAbkrq/uv3wZReGqOeXyJ2vq8NexaAJ9N9C2B4EB1IcnCpSYSKWvTl+/m7x05eHDe3ey2Qfd6gmv250vuKo1VPpR0jBAX4EsCAyIHsk7l756PfnwTrbbNdutlrn3zm3KVrVe8mCbh67Wy7qqBNEYzyS7/ek+AA8nMAmB4xd1HLaJ9PTdS5ls1+yh6/ZwGBI1FWcV+8XpOoDkYCscKDlW76j9tPKGN0CrNxAYwu7Zm3d+Jpl5UG0zeCuMnQ3OV83xi1QdCOCPhg1wYSs/6wHQDgIDxLd/5Kamk5mq2ap2V2pNy12f3WmwR/ehbYBLjwYBQiAVKL4o2WuZbPSMPXmnzR4bQH23o+4D/E0L6JhAP4FrEHio5RNvX+zbKxqMXrF4Gu310390VLuFt54AITCgxD6+KMNntmDPSt9tqPuVnz3PuQAeVmAcAgeLiv1zdw8f7NkAnX8QrZVKngAh8OgHr8BKTJ+18cFev9Vl8qeVt/JzngAhMAB9qVuZlrkeZ/hgj/ztNjR1v4UP+ZwPQD+Bq/MQ6J1o6Usns6bJpm8K9gb9dRz+FO3J8zkPgQSQ7kgrEHgQfd1WdZPpg72BKnq90VCdJ/Di3DgA30HgWEWtTx2pm1mzKktSHPZcrepfPmqacwGfjgnw3ePS0nYZAv89fomZTKtaM6R4QPZqI6KHAygkxjK1Wanoq3pd7WhOgOWNV6XxALJKS5+wgT5ZN/xunDXNeV99Y4EbeBv1k9aqV7peqyudhqo5BCrq09IcayyAjyHwL3t3G9NGHQdw/NrGhBcSoy7xjcaYGE00vlDjs69gWWEpcaYIIUEqhdXw2NbhSqgYhDhG2ygTjcUh1ZGCKw++aGh8s7CNDAeiGA0zLhqDMyGBkGySETS+8HfX3n69u/9dr+31uDv2TRyjMzGmn/z+D1dUIjMz/B55ceNniX1fJneADrm1MK/tQvPz6yLNK9zXhWt9q/fat0l+CLDv7HsZAeIaXPVJ822BEmvvww8tTkyjPrn2GHisu/LpXdC2tX1j8+9PPwuFIpE53xw0wzQno4S84mnhC9wuCCK89K0gwkvXrl2DX+Dy5RQb+2FoG/hjAWJiAJkZeHsfKORHr71PPrfwL3nplaKXktcC7oDd5mQokcLmi4Swz5J9Kojw0oeC8CXs7bTfMsEXGZ0Sfn9KEDLjeuO/AgvwF+BPPsDbAkX53fXABH3jl529FL359e3Nz+ZS6iIstxCGDuX0qaw+lNPbuXVKTrS/3p1SR1YAIatAYN/+FmgCfgdeWJh4i7/2lovGzr3p3a3tv0MzM98k5x2PXc4CdQOw72xtdUPWAKvkCTx5snhtHwg00Zd+99Frb0Z7iI+xt35jMvLNNzNzEY4wQwCUJ7C376ytuYFNPkChwD6ewJNM+0EggV95RnwtjL2ZjPYMvga/33u2rflYZoBYEmCtUGAfIzDN3j4RSO/9Hr4H+BWhPfGS+M6vb4dmYPCl2zPeCJQz/97faWs+04AAuYkBhKxiAhlz+0eg2QTT75414If2pEff9Pr2KuCjB18kZGiAGQXC/ctsY/WZYzkBFArskxB4vzEF0vxMLywCPxlP0ph1d2syNfkidHs/AfdyBPaeOvt6VfOxYzkBrLVCtSmBCLBXROCiIQUCP+qRDeAnT9/8dgjxMRl8BEpv/n6fnLU1dB+DGrAsAe5rgRYzXDtvbLxVJEdf+fqmbwX0Mfj2C8C3xfX1nlqdbSvtPnNMLkCMA5AjsI9pnwg0w9njiac3yu+Ucepomb8B+nw+1JeTwE8vkA1duCDXVq7crp3KrfcJ9UKn/j77RVlp89HmZiJATAJgLQ2QK7BvHwmkH3vcs3gZ+YmfeXe3Q6AvEvL5IvIAgtPUlEs+ZKX/AmTC+2nNj0Ahybff/nv1j5132mobuoFfzgAhFqAVPh+47wTSh4+X4OxxPgO/8fHzW6vf0LPPB5EECuHF4wAOxMVDkSvXd2ZnPy6zWasqKtqrW+vra9gq6+laeTmEVafXnl6FsOR7y3mrrUy1VmE2W6ONVxmvtmR1bK+++moZ/NuUvtbcffQM6FMGYNoM7NsnAoHfvU/j5k9059cyvxleiYI+togwpBdnxl08dOX67Ou2ilZ7R1fJmDfYAwVTeYPe9Dr5DSXrHMJO0LHfdJ2AupKduPX7wcFB+leI/ZZpAPuA1JuYPfW1UrKjlUfpWqFmKG+AtSmAaQL79oVA+vDx7MLli29l4De9tboSRn0IkBssznFmkQ1dn62rqukYCnqcLpfL4+mhQ2d8cWNMQxxsvLoEITBEhnXQwRcmsjWsMnP1R9Prhs6c6XY4wB0fIJYdwP0o0ASHjxcnLhZnWHt3t304/EQEwveMvdD1j631g16nyx9wOj2Ajps2AbpzBNitPEAU2JdB4F+6v5GGw6/5voVfcfyR+a1PrkxFfcK4gw/sRXbq2o8EXX6/y+kJBg8f9sJCKwIQ0hnAyqOc5APEpADWsgBRYJ/RBdLjb0Hy8EFv/dZXp1Z8EZ8owOTgi1+vq+7y+MGeB+QdDrLtDUAUqBOAVbcA7iOBJnr3N10kya9/PTQVBn7k6Ml34dsLkR2r2+uK+V09PZ0w9TAlAGKaBNjNAwjlD7CxMSmwjyPwqrEEwunjwNMbuPoSp99WCE4e4sHoC+1Y7cGmWMAZ9B724hk3Z4CYGgCxvQeYigGYFAgAjTsDYfw9syh1+IXptxVBfiR9sOx+7vXH/M5gas3NGiBmTIANOQEkC+w1lEALZbln47zE8gtHjxCePPjBXUtix3rEGWtyIjlJgJg2AbqVAggpAZAR2Ntn0BloNlMPw6OPtyT4zU9OhUVnXzy0U1USGPU7PVxzPZBcgJDWAdYQAGLyAWII7yNpgKICjxtBoIWiHt/4VXz8tSyd34STL7kQra/LNer3eN7weDx5AsQKAhDKZwKqBhDiA4QaYBXmC7xqAIGw/bt/AcefkF/59sqKmL749cYOZwz0sakFENILwGP5AzSyQAt113MT4v7Gx7eiIpu/RDwy2/pGE6y8EBkglCdATA2AmNoAPyIChBAgUeBXOhfIbP8uXxQff7ury2Hyzg+OHV3+mAvQKQgQMyTAhnwAQu/xBfbqXKAFbl82+otEx1+/yOobiSduNnv9uPRmDRBTACCmGEC3TICYGEBIKYAoEPtdzwIt9PavWHz8zUemokR+vo/tTlx6JQBCmgV4UGGA3XIBYmIAITJAm6EEgr/HNi6Kjr/yzakwkV+0riMA/MjlCRATA4hpbAKqAJAkcOT3r3i3McfpdCDQQpme/vdO0fG3Hp0i8rtiK/Ejv0wAofwAYmoAxJQDCCkIsEw4A1HgcQwEPqRtgSbqwFP/Fonu/m5MhUn8ImVDwM95G2AuAKEsAUJ8gESBV1P4dCTQQt370+Ui0cOvTzj+rvjikboxmp8SADEEyC0LgJhiAN2aBUgWePy4vgRaqIfX3ioSvfubWhH6SyQ+fqUJ+GUHEFIA4Jj2AR4lA5Reg3MASBI4ojuBZurRtfJiEX/Tk3D3FxXwu2kPAD+1AEJ6AwjlDRATA2gQgXD9Vyx2+RKe8kUh7uobbnY1OTFxgYUBOIYAsWwBYvoFaAiBZuqRxWKxz/1t0+OPBzCRsL0R8ztzAggpA3BIDYCYEgCxXAFCfID6F2imHhe7/htvmVwGfhyAVyKJm6/EAoBOHYCYAQE25A9Q9wJpf2LHj/M+1h8KjPva/aMoT/4mUBogJgvgmCRATDGAbo0C1L1AM/Xy4kXR7d8K4w8BRhPx2c6Yy5kHQEh9gJCmAGZag7MBqG+BZurJDfL+rx9uX2D7xwF4Je77fBQOH7cBag+gPgVa4P6lX+T2b3M5HOUEh9/ZII4/eQKBmzoAoWwBYjoGqGuBFvL9X0sLPHxbhe0ft0SiOQbjL2eAmCIAh5QGKC1QEYBYjgAhUYC2UrkCf9KIQBP1BN9fC0T7K49M8f3Fd8bOuZzqA8QMCLBBAYCYXIF3aEMgPP9l/aE9xt/SdJjnL+yLl/ljTkw+wB55ADEZAOVvAhUD6NYqwDSBbXIF3q0FgSbqwMKvxWgvzd/u8FSU6y8x5z7nd+YJEFMdIKQtgBnW4OwAYlX6EWihqKcvF6G9NH/zUyvRcDiKXYnveM85XcYF2GEUgPoRCP/sx/4taiH5W18Gf+kAYfltijldrlwEIrdMADF5AEkClQeIaRagTgVS90+I+LsUZsLlN9F8LgD+8geIaRbgB+oAhLIEiAkB6lCgmXp2oVhk/oVTsf58R84FXC4NAOyUDxDTOMAGJQDmIdBC7UkW6sm1ixL+EGA4/uUbsP3LAyCkPEBIbYBu1QBiGQESBdae/XNElsA1tQWivycWM8w/KHn8+Jje/hkB4KDGAJLX4LwAosDfNC3QQt210P8X8fwL/jD6+GE91+R0GR9gh6EAttWe/UXDAmHj+dzlInF/CNDHHj8QYLYC0ZsAIJQXQJJA5QFi2gVo4wOs+0jTAqkHJkT8DXMAJhJuevtnSIDia7A6AFFg1gCtmQG2MTNQoycRE3wCgehvd3k4mu5vbu4I+NMSwE4OQE2dQrQGkC8Q0ohAC3Xgp2KCv/Hp8ArHXyI6BP6UAAgpDJAVqJ1TiFIAyQKlAUJ8gPJn4JLKAs30E7higr9+3zLX35dB8HcbYF4AHdICCwrwVfmr8H2qCJR+ArK0yvO34wR/egOYcRM4iAB56QigNSNAssCR079/9f27whmopkCTyA300ualMM8fXP8pBRAiAYTyAggpDFBaoIYB2kgAJQSqPwPxI4DFpAPIttCfy2VogAMqApQWWDCAAoEjYgLvKLhA3AAeJwCEDyAMc/15Yi4tAuy8DZAGaJUHUCBwZK8Fmsk3gHABw/V3E/wpChBSHiAKlAaI6Q9gaQaAGBlgm2yBayoINFFPkD4CM94SXuH6C466VADYwwMYNCBAOQJf46YkQKgxXeDIngo0U+YX+4X++pcml7nrL/jTK8ATmQCKn0L0BNAqC6BQ4Agj8Mc9m4H3kT4DfZV7AElc98ZcBQCIIUAoP4BQTgClR6AuAdqIAMkC31dXID6CW+T564euznP8zV0vAX/qAOyRDRDTNUBJgcoDJAgcQYGqnUTwBPwi1x7T+K/DK+n+wvaYSy8Ax/YvQKscgASBI5IC7y7EDESAL0wUsfawpT+W0/1F3aMBfQEcygwQEwIcKCBASB5AaYHSADESQPkC36UrxAzEEzAswP38uBvA6NwZ8KcEQEwKYA8XYNCAAEkC1QeIAkcIAt/FUKDyC/BTl8uF/ta5/qxNTS51AQaVAYhlAjhoDIDWrACiwBGOQLRXaIEm6tmNIoG/8X7uBrDMiQOQmBYBDuUGEOIBxPQJ0CYF8HWBQLiN+QHEqSPQQj24VtwvaGnyUrq/m95YQE2AkFyAmFyAmJYAkn82rvAAUeCIqgKx538uFlmA0d/gaEBfAMc0D7A7V4CYIgBR4IiqAvEKcIGwAP+a/gh45svKpoAuAQ5lBIgJAQ4UGKBDLkAsS4AYESAKrFVfIF4BniQuwFE8gEQrXAAQUgYgJgEQ4gAMGh9g8x4BRIEj6gu0UM9OFAkX4K3vwsM4ABuDo4G9ABhUDKD0KQTbtwCTqzATnoVVEGihDqwVkxbgL4dvAZz770QsgABF0yTAnEcgDyCmU4A2LkDNCIQPIQgBLq0uhwEgewCxNwV0AJDzP3Q9fJgVmRfAAVUAYgKAUOEBosDfTqsmEP9L0CILMJTcAA43u0Y1B5D9W1mP9MDjACspKenqgleGmDpTQ1FbALvzBvgJCswLIN5IqyQQe+7nYtIV9PAtgDP/eEcDGgHI/jE92roGOw4etNfU1Le2OqBqpoqKdroK5msF1NDeXl3taK2sr3Ef+mAQXA4lSeYL0K4MQIdcgFi2ALF0gHXEEfh6mcoCTdSTi4QBeONSmAUIG8CO0QCmDEBMEiAeg3s8Hvimc+xEV4f9EJgDcMnAmQPDVzEaYuptq6JhVoNFoJicjRkAQqoAxPYWIAos9FkYHwKf/EuwAdy9NJwK5t9OpXMPAQZpekHv4aGSIwcP1QM8ulYYemwODAGiQETIVsVUWlFR3Vrz5gDMRFi3bwNkAaos0EQ9I7yDPnkVPoTFAoyGK3ABVmUNRoDM1Ds89MpBGHk0tc/r2bIGiAIxxmFpRXtrZQfMQ5bhAMYDiBkaIF8gVIBVGO+g+wnP4OAEwjb33xHwpz5A+k+8J16xAz2ohq4+PQTISx5ArDQ5D6vr7QO0QvkA7YoCxHIACCkFkDwDewsk0EQ9IhyA4yeHV9DfzUqXqgDZwTfWddBNk6vBOAJzWYPJJTeH8KZVvVZdeZBekwfVAgjJB4hxAH6iGEAU2CYQ+HtBBJopywJhAG7jAIwON+ACLAdg3gLhheDQoN0N9NxQjQoAMXjnSisclfRhuUstgI69AigxAt/hCzwteha+BwQqOwCXppeHbzXzzwD441ZAgE5PT2cXjc99K9UAIsJGa2l7TccgGJQGaDcuQBUEig9AeAaCCzCegAu9BnucMPrguMFMvrwBQjkCrKJrbLS+5qg8CAgJACF9AGzMGaBA4GlpgUoOwN1LuACHG5hnwIVdg1P6vCWw6XMfOnTIrSxALCNAFAhZAWGp482OrsHCASRvAjUBkCfwtPICyQPwJP1zcHgCdgeaVADoAX32pL5MADEEqPAaXIXBe1ZVXd8BdzMEgJCGAFYpClANgeQBeHUeTyAzNz/3xvz+AgOElbcEVl6aHhGg+mswZoVsNmtFqx0MKgsQywTwGAsQ4wD8RAwglCtAocDTCgrEO0DCAIwsI8CPOsBf3gAxgj5nz9iRQ247pBmApVyAED0IHYcGBgsD0LFXAOvIAMkCTysnEB+CbBSRfg4EF+BKpxAglDdA5Pc/e/cWGkcVx3HceAFfRBQVQX1SVBRFEPHuQxLdZUlp1oyp0matSXY3W9w2JSXYbpLSesuFDaWmklAbuimoRJQWFIqYJ00hTdNK8VoVrRQFi6i1wQsV/Gd2J7/dM2cy/5k5s5nd9vsk+iL0wznnf2Z2OrSS4DXpWS2BAQBoGGzaRAYBkKpugD4JxFPgbvMC+AUtgMYVYNeWyQyl+hCIvXdfY5OuTzVAI08AIRAG6+LJHXmDfgJcpQog5R6gKHC3OoH4GNFSD+HeO7chkyJ//uzB9M908qO3qRQD5C+BfIAoHG5fER8eGFAA0PYQCIBdZQYoF7hbmUC8B3jKtACOHln0l+2lCUQxQPDbSHtv/UJOASKvABEHIAyG1m/YNBA8gM1qAfolEAvgtTNXSN6DHsMEkkxlVAPE0e+JPD/GEvjMcu7BIVnhhrrnk5s2+QdwlROAlCVAyiNACCSAELjZs8CL6ZcgV4Fev17xAjgf3zcJgN6mEKTzizQSP6OmQB8CQ/Iawg0rNtRv8gYQLQ9ASgLQWuBuNQLxU7hTsKdHJ8CSBZD8qQdIm2/jE0319ZUNkAimw6FnhzedDwCVC8TXiPpLo/dQ8RA4vpEBcNChwERiqBGLnwgQeQSIXALkCGwIp9u7kgPDfgBc5Q0g/q4QygNACPx2NwBaCtwMgYw7mF8MdlgA/8YCOLriCfJnpApgorMWi59KgNwlUClAKt2wQhsYMAAm3QKcEAUGDGBeIABCIPDpsQXWXPTIzOWiwBP0MSzcQQ8pAwh+++rrG+vFnAJEALgce3C+dHiXVtiJNVROgBCoHCCK0i4sEwh7PIHo/t9OiQvgu9NYANvq4U8NwETrAr9GCUCZQI9jMPIbIBGMraHDoHuA8j3YLUAqDxBZAqS4APfqAneLAhFPIBbAW45fYdqBT89iAXxubQlAkaBzgImNjcQvD7CSDoH2APXDIBH0AnAieABbSgHqApFHgTX0RfKrBICH6WMwwgLIACgRaHH4I375qg9gQ0MsRgSHgwNwjXqAJPBbrwIxgtQcEifghV+C4A5QGxIAZmwBIovdlwMQeQSI/BuDSwrHGlY1DXsGCIGeASLztznCzgGqWAOxAD5MI4jY2OICePCvDZOpTHGeANLVC/hxAXqcQpB/Y7BYrKEraUnQBuBEwAGqEYju/k3YgfNP4fAQRB3ARGIf+EkPgQEA6G0PBsH2XhD0E+A2ASAE+gZQhUB8knzmlOkOBi+iHvxLG08VACKXABNrG+HPfgpBHsdgVEaA4VgsFB9OsgEiM8BVLgFSBYDIDDBMAPX4AOUCv3MmEE9BrC+hD87HayflABEXYCLSKFZfWYdARwDD4Vi6WRtmAHxeXAIDB9B8CKSi34sCtzsRiDdRLxMB/jE7uvgUWBtkA5QJLBl+G1ca8Cp0CglZJgOoE6zTmoINkHIMUIFAfJFyqRFkdGu8cSpFiQLtAKKiu7+VKx0CRB4BIt+nEBQuEHzKTJALEAI9A0QCQAjkA7QU+KNTgTX0IpZpBPkZI0i71jqpBGBiH/mDQN4UglRMIfwlUCFAKtrQ2+QQ4IQjgNtsAK5RDRAC6Rz4I1vgxRa/BjaNIJ8bj4FHc70DUykFABOdK8mfQ4AVP4UYxVqataayANwJgf4CVCAQn0QV/X09jV+CxIcmAbA4RwAzQ8SPC1Au0CNAVEaAKBpbsaFpCYCCwCUBtnEBovbSLABSbIBuBD4onUGuNu3AR/+cxR1MkvBZAUQ2ABORgr+gHQJXWKUMIAiGe5MOAE6UBSCyAogEgKiFK3D/IxfVmC4BrzTtwN14Ff/g/HNbJh0AlI/Bg600/VY9wJAVQOzDa7Qm3wHulAIM+QnwAxLImkT69tcw3gRc+BwHPscWpxHEQiAXYKYT+pwDRB4BorJPIVgE1yfdHwK9A0QSgGm3APkCLz1+g3kHfgCP4fAmKkaQpqmUR4CZtStra+HP6RSCVIzB/CVQKUAQDGlJFkDKCcBt5QUoLoHsNfDkNaYd+Lj4GK6v/0gWI8jGSY8AMxHypxpgIPdgBkASmG5L+goQAssI0CzwrFTg4eO32c/Acz8fGCt+DAyAYhyAg+TPLUBRoEeAqPwAUVpfBBnPQpYA2OYWIJIDpASAvEOgWeBZXeDr4h78zY3CCogZGADfmS08Bxmd76XPwTAAUnKAmcFa8pcHiIJ0CCw/wLS+CNoCpCoKoFzgZqHX7xBOgBfP9At192ezuVxhBHmuEwBTDICCwMEE+ctXPQA9CkxTtAhucAqQYgGkZABDygHaCDxLAr/7abUo8F7xi0QnTTvwxwfGCgBH25LwB4DIBiBdv1CeASInANUJVA+QFsFnTUugE4BtbgEiM8C0J4CiwLOUZAm81Oo5MACemSWAufyLWPvcAcT1CwAWx59CeABRhQBMp1vqNBuAFBsgVSaAyAyQBJ4tFvjdD5+9LgJ8VHgT65BpB+6mHZjSd2At4QIg/IGfAPB8nkIKAGMt4bjmB0AILD/AvdGXf4RA+CvqfvHnmKekOzABpLqGpzICQGuBAAh/igAij4dAtHwAIbDlqaSNQCuAlHqAUoEt/CmE/PWc/nJpfydeuroU4O2H5Dswld+BXQDE9bMA0FrgeQkwFmsJaTZLYEUBLPX3MvyhS0/eafNrpO7uXDanl9+BCSDiAKSw/hVXPQAV7cFUS/p5jQ2Q4gGkzADNAhkA+VMIxx91Yv8tNo9B5ug5cAHg2LqmqYwcILIAmHka8hQARB7HYLTsU0hsoZFolyCQB5BSD5ByfQgU/L0Bf6X30A+YPgstADx62gCo78CuAMIfYw9mjcHIwRgc1D04DYHUSLNmCZDiAqRKAFJlBSj4w/mvpMP5BRAAb/zlqtL9t/vE70dy+ehd/EFLgEgGcLCzVg1Aygpg5R4CATAvsOE5jbEHlwsg5QYgy9+lM1dfdLHFz+G69frpk1i5QmNdTZMpNkBqEWCmtVY1QOTxEIiCMIXkBcaehUAuQEo9QMrlIbCH429u82M1OkD8IF0/Anaj/qO/Ygd+7rVJMuccYAr+2ALPZ4B0H9OmWe7BqgBS/gHsabH2hw5/dMtFNcInYa7KwwPAd6YLAN87pyUAkLkH6/4StVUC0O8pBI3UaQyAFA8gZQ0QqQHI97f/esMf3oQRABqPQaiDOzeNp5wDpGof9wEg8jiFoECMwYbAEATyAFLqAVKOXoqGvzdY/i4RnsOd1Pdf1D/3t7EDj2bjtANTTgFmIo8zAFIygCiAAP2YQiAwrGkSgFQJwPWWAKkSgJT/APn+5uCv+Dnc5eIO/OcB7MCdHIBUMUDyV6sSIGUFsHIPgSUAMYo8rwl7sAKAiA2Q4gKEvzfesPb3OgV/xQBvOCTuwHNfTBszyJpkiuIDpAhgivz5AxB5PASiwEwhhTvpdSRw2QE6WALhj4I/wZ7MH57DlS6AJ14tuoTZMQV4XICpDuLnSmCVAAw5B4hoGJbtwYoAUmaA3vZg+KPgD/ak/nAEnDEdAX8+sHgJo+HXSOw9eHBtbSUCDMIUojeyTVMDkLIGiLwChD8K/iDPwh9exRKPgKdncQRsdQww05r3588UgqpxDF68jmEDpAAwnxRgyBFAiv+BGPijdH/AJ/cnvQVEfb8fWbyEGYY/LkDyxwCI3AKszilkoWhPsyYApIoBrmcDpPwGCH8Uvf/3yWqOP7yN/5Z4BPx62jgB5ia2MAFCYIbkKQdInUcASeAaQaACgBDIBBjjAWyJFvl78VOmPxwBH+p+c4kj4JBTgJkIA6CXQyAK8BTibgwGwGhPg7ZsAPlLIN/fCbk/+nfX0INg8RYQR8Dk4LgzgKmO2sftBJ4HAEMeAZLAcFzcg/0HyN+DvfvDDzKXuAXcOQB/LIGpTvhjL4FBARicKSQKgZ4AUjKAokAXAL3uvwB40y8CwL7uI9mc3rHcxAuTjgCmWoGPD/DCGCwD2EICOQApAMwnBRhiAzRiAGxpcbn+ofvFa+i5vw/kFo+Anc4AZvbl4V0Yg11PIQC4KHDCqAjg+kAAZKx/lMwfvslxqF88Av56QDgCsgFiAHEE8MLDOJnAhT/lBghUARACWQDtrqLJ35lvX7T11/ch/En/gtbu0o6+s/gy6j84AnIApgpPQC6MwSoA6gLD8WUDSNkAjHL9kTNLgHfOiEfAvtxW4xrwqVcmU3yBxgGwcqcQBsByHgINgdiDVQOUj8FMgPr69+KLrvwB4NXma+jZ3OK7gEMMgOjx5QdIAgGw0qeQheg+0A4gZQmQkgCkvAPU/VHu/OH3SL9dJhwBf/4K19CDTgB26OSCOIUEHaBkCoHAdo0P0EgKMMQHaLQEwKjuj3LjD9fQNccL/gDwj6JraPLHBvg02F14GKcMIAkMaRMQiP/h5QQIf5R7f/Tfbj5+yvoaOrRlig+w9fFI+QG63YMrZgrRBdZpygBCIAtgzApgNHya/OWz9jcHf1YAHzlpuobeujiDtL3gAGAk4gFgUA6BwQJo/IHv3RYvL0AkAQh/BkCpv9WrhfWP9xykf+7d2WzWmEFaCSBTYMcCwIqfQoI1Bi/+gY9A4Cq9LnuAiAGQuQdL/FHvi/5WUyx/NITcIT4HOUrfBcwaM0hq3A4gbmCCAvCZ6hmDi7a8rrgMIHIKkHIJ0Nof7PH9XfRvt/lVGAPguR2TNgAR+SOAQRiDn6n4n2YCYBR3HusKAtcxAFIeASIJwGj6TKk/2ENLn//wLtZ+0+v4nxPAbP45yL4pJsBUR0QvCGMwbw/2DBD5D5DaG+11BrDOCiDlFCCS+lsNe0x/OAJed1ycQU78Pp0tANw5ZA8QGzAVjDH4mYAcApVMIRCYjisFSLkCSP6E/Rf8rP3xH8Sd6J/emgd4LLcuwQSYiFCe9uDGoBwCAwawWGAoXkaASAAYbT/zZen658of/nYG87tYY1mKAG7VxscB0Jy4AVfFFML+QpFHgXyAELhrQaDxlWi1ANmHQPL3o3d/mEHuzT+IQ/QgzgA4P8wDmOqMBBWgiykkuABbetriIkBkA5ASAFJsgKj9HYY/xvyL36R3l0YP4gyA57ZMsQAORvgAUfWMwf5NIaJAGoVZAMUx2BNA5f5QzcKXKUWA308TQCp3sH0jC2BqbQTxAVbRGNzsDSB/CRyJ9hLAdTyAdVYAKZcA0+EzavzhB0mmIbgvuzWrlzu2s5MDMNUaWX6AyzKFIN+nEIzCmluAlACQYgFU7w8AbxWfBM99PZ3NdyzXO8haAaHP2R5cPWNws28/zYRADCJ+AxQFFvlTuP/i6/jCDpwfgqmx+eQkhhBp2IDdAAzoGMyeQpQsgXyAGETyALscANxlC5CyA5huP/OtovkXD0Lu+E8+BFPH5gemGAD1DbgSppA91QGQBpESgMgeIAoZ8QGmw+r8YQh+9L83SwF+9uesAfDcaxyAESFbgKicACkRYOCnkKhU4N5wnAmwThlA0d92j/4A8ORh0y/iDIAHzw3ZA0yt9QBQ+RiMyjQGI88A+Utgz5q4W4DIAcCYE3/Xsvzh7wfZL3kd2gD4z6A9wNYIB2AwphDGHlwOgN734J5tveUGmG5X6Q8zyF1WtzDUsb9SdgALz+AqZAwuC0D1YzAEIv9WQASAyv0B4H2mW5j+6awBsHdyHADlPR3hAWQJDApA9hSieA/mA9wbfr5Lb70g0BKg3SGwYSErgII/y/dfPoI/LsDbZ0y3MLMFf2PZ5JQdwExEsgIGdgrZsyfYAO2nEAhs7nULMOQcYBjP37D+mXLuDz9KR/r7+HmAW3fYARxfuwCwcsZgEWDgp5ColcCRkbYJW4CUEoAL/rYr9od3Yd4UAP5qADw2/5odwESkgwAGZAxepkMgUjGF8JfA6DovACkOQPjbLuy/3vwB4Ft94i3MaVwDDtkAHO+gIpU0Bu+pGoAje0O95QEYXrPgb7tSf/iL+vefKh2B+45+j1uY1qUBjj8ZMQBWyMM45QDVTyH8PbhnxQQBXO8RIAWAokD4o/L+3lax/wLgzccvgz29udHpLK4BAVBWh14ljcF+TCGovABpEy4AREsA3OUCIPxRis9/eBmL7KHN3VsXrwHbxvWsr2B0f5U1Bu8JNEAnUwgJbOh1BBACuQDhj1K5/uEXSSev6iuOXsaazRoA45NLARwf1PkFaAphjMFqAKJyAaTMAGkT7l0aIOUJIPzpAtX5wzWgCPDo31+NGQCbppYEuDZoAJf9ENjMBahkD9Y34TxAxAZI2QIU/KnbfwHwnhkR4McGwLHsjqUAjic6qMobg/dUEUCahJ91ABAxATbo9y9GCv0B4AP/XVYK8LNfv8oZAF8DQMsFsOLGYCbA4E0hsj2YNuF163kAKVuAVIm/XcX+VO6/6F4TwD8NgMfmhwBQcgXTQVXIGPw/O/ca01YZxgG86tToB+93jffLB6PRaLzEWwxka7Q0DkRLEEZHnULGMOmQ4HQ6hQ8ik7BU0Okom8YoU0RLPdW6kMYqqAEGliVq5jQm02Qjwxt+UJlPT9vztO95T8/bs/ecvof4j/JBs0/88jzPv+d0ZrcQjNUAB2rJEcgPoOsh8/3B66hfEgB/e18BuDrfBJQHoB1r8Db+LQRjbQuBhFesygdwkwGAFvjDzDy+kQA4+1UG4D8btAEOrk7KE62FEABZdrCNANIEQvJOQPhXBRBDAWixv5OHUxsYM7nns+2Z96H780zAR0UEWPwW8gD/FqIDcMDVyBUg+vvDNH+Yi1QAJ17BByHgTwNg/+ocgHZ6JxWypAAGBsoaeQMk/f1klj94EnfqRiLKg5DIFm2AnXXZAG31TiojwHoBW8hKOsCVbAAhugAhVvjDnEIAhPeh8UHIDgRIvQAFrMHNTC3ErjWYDhA+DGzkCNAKf5jbSICT7yoAI/drAux8tA5GoIA1mAUgxKY1WAtgwE+OQAS4yQBA6/xRn8Rtz0zA9VoABz11dXU2aCHewncwAqy3+AhsMj4Cw65GIwAhFICM/o7n4A9ywecEwMSnCsDtTyBA8gIUFmAzvyNQwBZCBQgZqPRzA2ipv/xP4l5HgOQAhIhZg1kAQiwBiDEbYLiJHIHGAfqy/T1njj/MtSTA+O8I8AUNgGvqIILWYG4AQaCALWQlHeCT4cpGfYAQfYC+LebPP8xRN5BP4uIH3s8AfHoNHeDgYymAYraQZo0jcIkDrPFrAdzECDDjbxb9dZjkD3PyHSqAO/FRsPwkbhAAqgdg0Y9AYwBRIAtAfjXYx6kGkwBR4MBLxAg0ABDnH/pzm+IPAbaRABM7M4+CX/6znwpw0CMCwCNqIRCWGlzP7QhkB2h8BO7gADB3/469JZnjD3PGTMofZnKfAvAfsKcGCO+hZgEU751Uji2EI0DTd/CTYRyBxgDS/Jm0fzEXzbyZ512EXWqAEHkAClyDmxkAQiwBiALNBxh4EEegMYArtswy+jvGwSmXqwHOawPEAShyDeYAUFeg9QAxdIAg8KFGPYCQPAChf7xqzfzDXEYCbJvYjC/DIEByANq/BhcfoIvpCGQHiA/kCIAlbAAf2jL7Woc1/jBnqQBu/Ix4GWZwMAWwP6sC26eFeBlG4INWtBCfaQBxBGa9k1A4QPD3akeHNf4wl/5IvA448TgC/IsG0GMvgEd4BNZbCRB3sOERaBzgQ5uS/jqs8Ye5/YtjNd/GiuzIBdif/NEpyxO7BjfbBKCLM0C4Av0GAYK/neAPks/fJPrjlatJgJPfIEDvrgYS4KCHBCjeVzPZAEIsAYgCLQCIj0MqCwKI/jq0/bmr0R+3XKkC+O77CsBH1AA7kxXYpi2kYIDsAi0BiNECCJ8FKgLpACE0gOivg/r8zQ1BfzxzPgJUvQ4YqSAA9sM3QersC9ArHEAXYwthB1jTSANYogPwoS3gLxOcf2iPtz/MxSmAmEQWwOfTAAcVgBs8sILt1UK8uiOQDpD/EegzDSAKHCjx4w5mBfgA9A/09xP4Q3vm+MNc9zkJ8FME+AQJsH+1AABLGQByOwIh+gAhDACt2cFNjQUDlPuvEph/aM8sf5jT/l2WCzD+MwJ8nQS4oc4DAi0AKMoRaBJADF+AkIFN/oIAKv5w/wI3mr/TwR//3LKRSHwOAd6zqz8X4BrwV/QazA0gRBcg1yPQZwHAsLMxDbCSBEgVyOhv8nv0Zx3AZwiADZ5kit5CSjm0EEaA7CNQFIBPPllfEMCXWPwdX43+rAT4GLGCyz0qgf8DNAQQw7eFQMK+RjXAEi2AJfz88Qc49VhmAvbLABs8qdishXgN7OB1ZhyBEA4AdY/AgD8NsFIfYIl/9rVi+MNcmw/g6lyAncUBuF4tUB8gvyMQog8Qog/Qih2Mz+O0AYrkjwDY1rYx/rsmwHIPCrTmnVTjO9g2AF38AdY26gDE/cvkj+i/JgFsk5MNcPv2NTkAOz16AIU/AkmAED2API9AiOkAIQOVMkAIDSBEmX/F9+e4Ge2RAKc2dyJAHIAQK2swfQcbbSHsAAsfgcIADLsa8wMUyJ/j5raUPwT4qwZAeApHE/g/QGMAMbxrMIScgJBsgKLcfxoA388AfLpBAdifHIAYe7UQr4EdvM6UIxDCBND4CMQaUpkMHaBA/hw3sAJs8BQPoIERWMXxCIToA4ToArRsB9fmByiQP8cdKoAHqADlAYixqgYb38ECAtTawfwAYg3JC5Dw18PfH3+Agx4WgMIfgSqAECuPQIgVAOFpSGUqdIAl9eBPSVH8IcA2AuBvCLAfAXYSAK2twRSBHFoII0D2ESgOQHg1nwBYkgWwslIYfxSAO6kAyz25EeQINAoQIg5AF/8aDC9lqQCWKP784vhzLFMD/IoECNngEROgXg02voPXmdNCIHoAuYxAp7KDEaCI/hxtKoCzFID9a6yfgEZHICeA2EK0BFYWPAJ9pu9gjF8DIPjbJ5C/vAA3g7w0wHISoMeiGmx8BwsIUHMH8wcYLvHTAYK/53rE8UcDiDfgrgzATlaAwrcQNUCIlUcgxBKAtZkRiABF9JcX4GYFYLkaoMU1eD3/GswOkH0EcgMIMQQQU58LEJK6/57r6RHIH9sE3AAAOYxAvgA5PIzTB8j/CKQL5FyDIQMv+RFgRuCm5PyDiOOPCnAzCbBcRICl/GrwU5a1EOt2MPZgBJjyBxHHHxPAhqIDNLSDeQIsYwIIEQYg9GASoHz/yRHHHxPAjygAIWZ/NVMIgKsgD8vJ+pNPJQN/qPHBnPiTqVeSQpoTkmzO+wFgFv+yAkB5hAAHtvhzAZbVg790hPFHB/g0fg6YTDkdoD1bCAEQBZIAt3m9Vd5V68oeWOGqrQmEwwFITTYH/MXTM0AkXFBqnK4VPqdBgLiDEWCZMv8gwvhjAdgpBsD15tVgEuDaKqBX5gwv7Alu7esby+Qnloyo8pP6v/SQGUn+2I0Z6Rnp7tu3UOMDg0YnYEDZwbK/Hdn+Ym9J7UL4ywtw86AMEPAV/QhEgLxrMAJEfetcgfmuJLy+WF8XZitL+pjSzZCR3Xt7di7UAkF2gPQdLLA/DYBPZwFsMB0ghhEg/xqcFgj6vCWB+a2xWGxrlzqWAMS0tLSM7G15u9ZncAe7MjtYYH8AkEgWwCkZYLkIAM1uIU/J/qqqygJ7YmMxwh33EcgOELK7ZcHpNASwJjMBBfaXH2A/AmSuwbZtIQ8vX+ucj42pJl9xdjACBIJ9AR87QMyA8j6CuP40AMoC35lq2JWpIOa2EEzRWsjDy1cFgrmzT4gdLGekZ8HVZADgS6kdXO8X118+gNtlgOV6ACH2B3j/U4GusTxnn3U7GOnBTyV79zmd+gDpH8T4BZ5/eQBCAGCygghxBJpag5ubKfxkdsHRoUgk+c9o6+joEC2jLPnQQEJ9LVnZPdvkRICMH8TIR2C90P40AELSAMsFBsipBnuXr9gzRuLrCg5FhoaCfb/OvffD4cXx8ba2Q1+PG87XlOT/n4tvHez+MJQj0NlU8A4W319+gJ27GvgAZBdofQ1evm0hFgrm6huNRIIH5g6P9ybikhSNxuOJZOLxqGWRJMm9eBAIosB9PmaA+AV1Nn8JZn9WA8QKYmoNxlhdg9dWuLpiOcOvaygyemBusTcqRRPu6ureZKoNZlor7lSm88TdLknjB0PdKPBtX6EAm3aI7k8LIEQGWA5ZyjW4qjk8Fsr2F4wMHXjvUBJfNcIzEveRZ9odlQ6H+lBg2FfgCq55WHR/LAAxS64GN2+bH8vl1zU3HpUAX3HtYaTxvlgGYE9LbRNLDcasFN5ffoAb+j3lIreQI/xq5raKsq5Q1vIFfvurpXh1rxj20gL/7e7DM9BV0AhcOftsjxINf8fx6R/8AYLAqTUflQsD0MARqAewYkUoy19wKrjfLSV6xbGXmYF4B+4ecLIBZPfn5uePP8ByBEgXaOsa/KIrhv6gehzslRJi2UsF7kD8LMbFCJD0F3rrF7W/9vbjEt+fy80ff4AeQwCFPwLT88+Zff5NbV2UEsLZSws8qAjsGXDqAWTz1y6n6POvUIBLpwZvK/XFstfvXEIS0V4y09FDoW68ApkA0v2hPWH8aQOEJAGKcwTyBVjxQNb9NzR0WEqIaC+dX/YrI7B7ZRNLDa5pIv0p9sTyRwLsbYvvVAC+IzxAow/jtj2yLqv/RoLjkqj25EiHFIB7FxhGIPjbl+NPakd72f7OLbo/R5a9ZAQGyLMG339/Kz59i2ztlYS1lxbY0ce+g2V/HS1Z/j64t11Ufw60Rwe4JGtw1SPzoWAw4++3RFRge8QO7umu1QUo+2uxhz+HrE5YgCYdgaWBWBCSnn+JuMj25EiLHyo9OKB3BKb8tdjDny7ApViDK8piwQzAoS53tPj22gs4AsNOTYDoD2IPf7oABToCeb2T2lzVGsoAbB06JOWzVz1x0jLrcxIJMPovPo5bcGkDRH8QW/izO0AjLaQ0HAumAi8fLEqac6/6pGUT1W/8+PfM8Mfm5BONfPy3CuB0H9MngegPks/fhaL4YwSI4QfQ+haCCzgD8J39EtUe6Fs2Mf338PDwiaedfdPd119/1TXXXHX99XefYEnuvvXvSQKgmw0g+oPYYf7pAxSshXAA2LwnlPEXORB3U++9iW+rZ4bvPO22yx1FyTnDy/JMQJ82QPQHAX+S8P7UAKO5AO3aQpZrAFxbWqMMwNah3jita/R++8bwzK1pfEcfZXVOdpySB2DPrFMDIOHPFvOPNgGXLsCkwGZvV5eygN+Tpt2qVAO/K65yQI456qijj3ZYnqMMArSlP12AoreQigJbCDYQ+ARacqszWZ3iB/gcPMMfICkwwOLv+Hax/NkeoM4IJAEuXxUKZhIZj6oH4ElvfHxlEkEh+gQByOZPnP7LBtC2NZg+AtfjAJw6KFH8zdx5epJAQREDoD396QK0SQ1m3MHL1+IAHGpTD8CThm/kMP04AwQ4UbcuQHj/Rf/+E8+fLkCbtBCmHQwDMDCmDMA59QCcGL7EUfxfUBZAmQ0LQPC3V9/fveL5ywUIH0n0SiqAdvhqJuMR2BwMKQPwUFTVP2YugOrrKGYQILohAfoIgCz+7oUcf69g/UMO2oNQAArfQirSYQDoLV2RdQH+otq/390ogr8UwHYGgCiw6W2aP7Qn+xNx/jkcGXu2Bag3AquyUjof0q7Ax7efd4wI/gwAVPtDe4L7c4A5JoAYMf+GIpYdjJ/B0D4DnPz4TDF+QQUCpPqT7dnBny5A29Rg/R3sxadwXe/88Ms0+QHMTYL8ggoEqPYHsY0/XYC2qcEMO7h0/sPMU+DR6XuJBey+E577OkRIgQCdOf7228yfLkDxj8CKTPQAVqwLtWYqyK+S6hOYu0T5DVEBxkiA6K+jRYn9/C0BgHojUNnA99WEWlvTG/iwNJ3r7z/27qW1iSgK4HiCEkFhBBEFXYj4QkXcqCCIuAgKjgYhoBiwILhUXPYLdCMIRRF05yaCgmBIfZGGijsX2vqoRSzGldKF4gvdFB9nmsfNXGdyxvF25pyT+1+5HJkf9865M6HTWzJUQgEOCPKHA+TyMg7fg/OfAWDIDvy6to3MLcIBCvKHAmQ0hSB78P7TdwcBYPND1Hv6EQyZJ8BAgG7h4eU2wLeHBgT5QwEymkKQPTh/YGQQmtuBr2sz8MLKVjr3qDfApwBQkL8+AnjkexMgNKGfQo/Xl5I4g44IUJA/FCCDKaSI7MHqEKYFcPBqYUg7A1xJx18IwOFhDSD4e8rfnwSA2BLYegQ8Cf68Ah4BF9b2ELpLfwN0S36AA3L8oQA5jcG99uCT8AjYBjjxsfrMN4KMVwjtwH6ArlcT4LACKMcfANTSALIag4s9AB65NDLVAqifAjrT2zOEagN0VTpAOf4irIBsPgnsvQef+wErYFPg/U+jfoCVjZTukwfQcaFwgHL89Q/A/VPnB1udd13/I2B9PaUbFQIQagM8c0qMPxQghymkqAoFuP902x/MIDMF7RFwAZlTaBTgBQB46sYbKf5MAoSSB4gvgU2A+cMjbYATH6raLzE3ZCiFAHx54FAEf7kyD38xAEIIwOS/ScX3YPgavw3w5nsN4PPdpG5VGEBobgW82O3vLnN/RgAqgamPwcVQgCc6K+Dj3zPaezhKp4AYwNtvf0jyZxQglNIUgu/BR+50AN585D+HflJbR+pm9QIIDV+I4m85qf+SBXg8D6cwre7/HPXPIA1Kx9ChADsCRflDAbKYQopdhQAsqlOYwVHXB7A8TedTLAygOH+GAKpSAIgvgeDveOcU5trLewXC70F6AxTnLw5ACAGY9BiM78HFYyOdY8CvGsDZZbTuVzhASJo/EwAhswDN78G+Y8AvVW0IXk3rhvUEKM2fSYC6QFIAjz7sAPxWpfs1NAoQ9beKlz8UII+HQBTgka5z6I8aQDo/yAwFODYEAJvJWv+kAAwTqAAOjIS8CHGd+gpa9yxoBVQAZa1/AFAvJkBV4n81E18CAeAl9SLkVtX3l5vH67TOoRGAwvzFAIgJTGMMxgHeUQB/V8Fep0Xj9TWkzqE9gLUwgJAsf0wARnkIVOEAh1SLSP0iLgLAXv5o/UdSAqgE0gF4Nv8jHGCD1ouQEIBC/aEACT4E/i/AX36AkzVOAKX5kwIQEegHOOMDOF1iBFCcPxxg5JdxquR/mokD/Hy3cwzz654fILFvEcIBhvtbxNafEYC6wPmYQgwCfOQDmJtewgZgmL8lJbb+UIAsp5BiAMDO11gTj7QVcDMXgBL9mQSoIg3wpg5wMROAIv0lA1CVLEBVkT9Amf40gIXCM6YAEYH5K+wByvSXUfa8EIDIGKxKegzGAU5d5Q3w8oP31ZJAfxllLwbAUIHzMAb3N0D3/vt3Iv1lFL1ggEynkGIvgDPsAI79FLr+GQaoYgPQZQEQCAr1BwC1qmYB6hEC6HpxARgyfxD7kMfECjjDFKAusBfApj3uAEX4QwHGGoOh1L5JxQG+kAFQhj9TAKH5AaiyACX6QwGynUKKsgFK8WcaoMoC/C+A/eIvKYAqCzASwH7xxxQg/hAIyQUoyB8KMOYYDJmYQizAgMqS/BkDCAUCJPIQyAvgproThq9cluUPBShkCuEFcEXDCbYnz595gCpKUwgvgOsa40H2oFJpyZgof5IA5oUAXJBZrgB22YPk+eMKMNIUwhQgXEylNKrbE+oPBUhoCukXgHA122dzXfYk+zMLUIvQGBwOcAk9gNnM6prTtCfeX9D3gK9MASQ0BrNaAbOZNY3JUn/4QwFSfQj8H4BV4gAh2INLejmJ/kQBzEsBmM1s+3sJzM1K9BcHoMosQPNTCFeA0O6a4+NXdip7JfozABAbgw0ugX0DEK5nS20yV+48/eXcxpaMRH8oQFZ7sBiA3gXtbsyOOk4ul3OcybFaY6dMfxYgTYDeFa3ZUWtUvGqN2V1Zof6SBKhKFeBjFgDnLmnBpl379u1bu3G9N5gQvEYLUE8QQCCX7fq3zOUvJkCVWYDmx2DWAOGyss2krn5GAOJjsMElsM8A9kMYQF57sAXILgvQAvyXhAA8aAHaJAIMEagDJP45Vl+FAUSKC9DEN6kWoIS67Q1BCMBY36QaXAItQGkpe1AAQGZ7cDSArgVIppY9C9CWTmAuSYAqC9DGHGCkh0ALkHgoQMMv41QGxmDIAmQeBtDIGJz+HmwBUg0DSHkPtgAFlDhAlQGAkAXIO2kA8xYgrzgDjLQHW4C0+wvgOw2g8TFYZWAMhixA1mEASS+BBgCWLcB/jNgWzBhg2csC/LdEATxoACAUA2C5U8kCTLchvXnYgqGkAEKRAZa8LMCUU/LcuXSAeGYB4lNInCVQBzhHzwKkkLKHAIw9BpPYg/NXFMBP78oWIJlcVSBAfnuwBcgqDCCJPbgnQMgC5FsqAFWJAZyyAGmWDEDIEEAIAZi3ADmFA8QzCtD8EmgBUs4EQGQMprAHW4B/2Ld71oSBMIDjX65bhgSnNpNOdYuDkM/QQXDUwUqggVKKYKY6VCdBUJAiLY5dWlpo1VqoSOnLPTFeXu4uMSHo2d4P5bkjyZQ/yRRehQaYz2Q9Dlnyebc2OnZ0IsB/LizAQes60gU4xVosGYpsoQBd0zrFaHHKbpNKWbGJAPdV6BNwSbFYLthqixpBy+VyGjjS1o4BykKDAYF4ezlwhquIKEU0FFh4yHIR/eWyDPBCsZ3AcbyXZyJAPjEDBFfJNTbRacRjRqo4ZgEfui4C5BIzwORKFAZVdSMVgmnq5krD7NhMXe8E1H1EgJxKJ8BSFIMuboBsJkn3EgFyahsBAn4D/BQB7pIUlOwVnDTA9AoUAe4nyhOwafzpd7AIkCtEgJPbcTe+6BQNJLW27hx6THVkKALkCRGgNe9XS9gqqi4Cw68fptl0Js3YBtOzBbCHSyN1SYMwlytDpD8SAXJEClIltb2murz3zF+s143tC5s6Rkhv1MO+fX6we+zc8eh69Xvxe0c/1xvbfGqJAPkhEdTY2tjTmsX2QJgAvA73HAOcPvFsHZaqigC5ISUFX5Kk72wLVBEgR6SdIqrYBhEgT37bu6OUhmEwgOPthO+hgQljiDKwostGN6Q+qGwo8wC5Qc7nAfLsyo6wp74NcpG+2JSa1WnnwI5kzfe7Qv58IclD2IHa2B4GaAFgf2ptexigBSjbp93tlQFSDNCgGSfsVw60VwY48Vr7HfkJGAhgu1xprwBi7vkeMuU+SVmFU+0VQI4xQIM6dENYwb32Ckt5jluwSdOk62p76gkHRA8HoFkLDm62V0jlEAM0yfcu5Zo42Z6iBiAyquO9yDU42J4Cm2sfLwGNe5VZ2gXH2stxyGSI/VngaiZF9p4eCpQUjoQQwngN0kx7CifLVbLo4wnYAvkahM+xkMk/fYgGZLxJq3pCZiN8hLPDmRoD/XB4p13scVvnTXkqTbWRNtButh6+6z1WTapijcZ0V0CDrSiIfiK5rygjGs/H+QUgzj/DPgHD68VqXUfxTgAAAABJRU5ErkJggg==',
        },
        {
          label: this.resources.strings.set_checkbox_state,
          method: 'setCheckboxState',
          image:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABSElEQVQ4jY3Tv04UURzF8c9uRkIIMcRQGGN4AGsqyw2VsfUBpDPGxlAZKCyUUOALWBASrHwMS2OhrbEBbaAx8i/BwKGYC3t3HeKeZDJn5t7v+f3unbk90scrPMVt9A1V+ytd4De28LbBKl5gDT/LhIsOsF/d7+ENbiF7ZLkD6FCmSVP8MtlrMIfdCeAGn9oO8qQwc43udXZpDYvFP8AJGuSUDP5TfZH8JSEfy7sBOZ2geqaxXart43k9OhaQmQLUel1ahmf09scrlCXkDvlKPrce8pCcl9Y/jHGDlh0GPC4TQ76QBfK9PP8aht4YAHlZhRxX/lHH3lwHHJOlamClAkPe/wuPBhyOBox08oPM3hCwRA4b/NH+25V678g37NI76g5wF0cNdrBOzrSHifYwnWCezFfQ1We/j43CZopskoOyoZNcB4WZugROpLDHUvTMkwAAAABJRU5ErkJggg==',
        },
        {
          label: this.resources.strings.classify_asset,
          method: 'classifyAsset',
          image:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAWCAIAAACkFJBSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANASURBVDhPpZHZTxNRFMb9EwgEQkh44QUTeDGNPJBIAgoEUaMYESQYRQHjwhZI2dKyh002aSNthyWogFjZpCAIyFYFiy1xSoEOpVNop4WWLlg2ifWYIaSWeTB6ctKcc3u/X77vzqmGhoYf/1c2m42CUtY8WNo0UIz0F/H68zl9zOe9uezu7Poueh0/o+ZN6tOO5Ir2x2WvYnM45H0KClyFUygUUwNOZ9pbN+woN6xyYlu2bplXmr5gW8IlvUCEx2SySQkFBepGSuXps0HwC38DQqH7vqzZlq6ZjxEfpRs9n1ajMupoNBrcp6aAhXPX4hcUmjX9bxcjE5+bGpHGRoTL5bDZrFb+wNC8tm1cHplWBXoAUVAcEoELQJAnBwcHFouFycgVfCVaRxZJs9QUKPtEqMqMIDwYDg8PrVarwWDIpKd3z6p5g2jEk9K/SkRsmsSrRr5grLKyoqSkKC+PkZ2VWc1tey1cY/dKrj4sovYS2hsa0hMCp1Bkohm5YXpRP4ZuwFu8m9O8nVkHxIsJvJovupKYD9coKMHdwbodXWBn4IxIQiaalG0C4r1Eq7fsb5r34MNrTbuEcVelM1+KZ1AnCuIHETuEdEvq/9Lfurs/JZaPfNMNiIk+kQYQtbenGOE90DAotaaLcdnUXgI6AmRG2Zxe9EE9ROPRcMIAejIFWAC9DrUJn+3DoCCMYXcyqSlgYVI7PqoZ7lXxWzCuT70PWGifVsFDQAoQA4KkrGiMIbHp1In8mv268E4+3taubEJWaqsW87zKvcBF4+iqemvHPhGm3gqOSQuMfAQqR8oZ7hkEY7Uo6luUtYiivEaakzV53yPfA9eZ4SFWCZNCY4yIiADEkmpTIpWL0WVQOVJ8Wb61SwUcRUkzXorICyuEqe557uiy8nICM/xebtjdrHkZlnCiHCneNd6lsnSWIgfBmKxZuhvDTYrh15PKoFE5TjbIjmcxukRBgVdgLiRWoklVwiTXXFfJAnbhVsr56GRo8J9TWBX1gAENA2Q5Xh0pnsWeaZKb9OFol2yXoyO7AsGc6meB4BAG+9WRAq8QJwhzznI+2v8skIHGnkKujhSw4ER3OlpOlH0i+9WR8m9ls9l+AdtkflUKb66rAAAAAElFTkSuQmCC',
        },
        {
          label: this.resources.strings.dates,
          method: 'dates',
          image:
            'data:image/gif;base64,R0lGODlhEgARAOYAAP/4/4Co8PDw/5Co8ICg8ICgwKC40LDA0FCA4JCo0KCwwEBw0KCowGCI4OBAEPBgMP+AYMA4EHCY4ICg4HCg8ICAgOA4ENze4WCQ4HCQ4EB44KC44JCw0NDg/+He4dDY0NDY4JCgsGBgYDBo0KCw0GBYYOfn5/Hy8bAwADxp0pCQkICo/4+Pj3CQsNXV1UBQYMDI0JCw/3BwcEBIYEBw4KSkpFCA0FB40Dxpw/+YgMfHx3CIsPD4/yAoIODo/4Cg0ICYwDBIYP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAASABEAAAfMgEKCg4SFhT0XiD0mPTo9Lj0nPR49gjVCKkIsQhWcQjJCIkIlH4IDAwETExIZGA0INjcLsyOmPre4MSsBAQS+FCmmqL0UrK4ICBoaNDiCBoI/0NIAPzwCQc6CQNraADxAAiAvgiQcQDs/5+k5EA8O6dhCCtJC0QAQQjwWPjDx80LbAHp7wINHBB8H/JlDpw6IAwsRUMATxEBQAiHUrP249aNDQordvgkQAORWAY/xGBgosGNDghYbWK7ckQBIvBBBcs7IybNnTkNADQUCADs=',
        },
        {
          label: this.resources.strings.click_submit_and_open_report,
          method: 'clickSubmitAndOpenReport',
          image:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAC1lBMVEUAAABEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREBEREAuLi4xMTEyMjIyMjIxMTExMTEzMzMxMTEyMjI0NDQxMTEzMzMzMzMyMjI0NDQ4ODgyMjIxMTExMTEzMzMxMTEyMjIyMjI/Pz8zMzMzMzM0NDQAAAAzMzMzMzMyMjI3NzYxMTEzMzM0NDM5OTgxMTExMTEyMjIyMjIzMzMxMTEqKiozMzMvLy8yMjI4ODgxMTEuLi4yMjIyMjIAAAAzMzM0NDQyMjJDQ0A0NDQxMTA1NTQ0NDQ0NDQ0NDQ0NDQ4ODY9PTwzMzMzMzMzMzMzMzMxMTEyMjIyMjIxMTExMTE0NDQzMzMyMjIxMTEzMzMzMzMwMDAxMTEyMjIxMTEyMjI1NTQxMTE2NjUxMTE3NzYxMTE+PjtAQDwzMzMyMjIyMjIzMzMxMTE0NDQzMzMyMjIxMTE0NDQxMTExMTEyMjIyMjIzMzMyMjI2NjYyMjIzMzMyMjIzMzM0NDQ1NTUzMzMxMTEyMjIyMjIzMzIyMjIxMTExMTE9PTszMzMxMTE3NzczMzM0NDQzMzM0NDQzMzMzMzM0NDQxMTE1NTQyMjIzMzMxMTExMTEyMjI4ODcxMTEzMzMxMTE1NTUxMTExMTEzMzMxMTEzMzMyMjI6OjoxMTE1NTQ/Pz04ODY0NDMxMTE0NDQyMjI0NDQxMTFVVVUzMzMyMjIwMDAyMjIzMzMzMzM0NDQ4ODc3NzYyMjI0NDQ1NTQ6Ojg0NDQyMjIxMTFBQT8zMzMwMDAzMzMkJCQxMTEzMzMqKioyMjJHR0Q1NTQ3NzY0NDQyMjIyMjIxMTExMTEyMjIzMzMxMTE1NTQyMjI0NDQ0NDQzMzM0NDQ0NDQzMzMvkLIvj7EwjKwwi6s3PwuJAAAA6nRSTlMAAQIDAwEEBQEFBgEHCAEICQIKCwILDA4MAg8OAhZNfqbI4fP8+/Hdwp5zPwkzh9P5vm8ZCGeyRAJj5cpOJMa2LEjx8mFU+wZVEM8SyQtWsQF7ONUTdx1Iebj46xkfd+pyD5veYENXWP6E5gXVKlJk4ZOVuVrYMewZD1laW/1cXV5fYWL26GXZuI4ha9pqjyww25bKN0PFnOIbvfdAKGSFex74aOZEp1HX524H7cz6Jvfr38OgRg36fhYwlJHdPTrSA+R/GPd2mLcoJPP0iSF8rC4G0S+jB83LDLcRklnrF6LEtHoUU4zV6vjxzCSWAAAQz0lEQVR42u2db4xcVRmHz5mdapNCtV0kFrcGjEaLLbhIqARjA/0AgjbFJhBipC0Um/pBMVJiQPwT0iZqJGA0ilhIhVgsCE1KbUronwjUlGiI0vZLIxKypLGhJRIhWDp7/DDbZe7sZnfn7j3nvu95n378TWF673Nn5p73PPObpuOP6T/N7sB750Igs5J1XwB93rkwTGYmK14AM9rXR4vMTFa4AGa2H3+HzE7WeQHMaj/+liMzk3VeALPbj7/Z+TBZ3pnz710Ac9qPv9H5MFne2YzhMHoBnNV+/PXOx8nyzmYO+9ELYI5vOOf90c7H54VAlnE2a9iP3gPM9t71eT/U+fhA+78hyzSbPeydG3kHmOU958hYNmfYOxfaF8BM+JvLzhr2zoWWa47OhzhHlrJ5p0b2BJqj+wNHOUeGsjb/d51rjuwPFNcHnCMDWXsm3HTjzAc4Ryb4v9UeBY+dD3KOTPB/c3QvoGt/QNMxzfftP/vb72N9nX+vpTS71Hu/wHt/MOr5O/2e3xyzP6iH/yLv9+hmPW62v50tHfT+b/HO3+uju4FhuKWR/8X+5B71rCfKdju3+BJ/INL5O/rednDRGVPCf2C+3+6y5u+ccwecW+ZfjntOu5xAJfzP80+6/Pk751rb/Ap/JOY5bWrk/wn/mBH+3rs/Xr/gmYjntKmQ/wK/xQ5/F7b0ff6ju6Kd06Y+/guHTfEPfe65y764M9I57bwA4C82e/5r1+yIw7/DCZwHf7nZwyu/vD3COS04gTr4X/SORf7Obb5p+bbKz2nRCYS/6OzBNZWf024nEP6is5e+csC8E2iZv9u/7tL9xp1A0/xb/v51xp3Aifj3Z7Rff+UHvPf+vrHXxPuu2GfZCbzo8IGJXyO5+BqHQnBu6Xf8Pd3vCfeut+wEmuHfzvYOrV7/0zHHu3xbhc+hywk0xt8PuYdc49UtxeP9yXcr5a/JCbx6jzX+zrnfrr1zQ/F4W1Xy1+QEmuTv3P3ruo535unPAGNO4KT8W5k6vI0f/KhwvHf/sLLn0OQETs7fZ+pw//KbXcfbqOo5NDmBU+Cf7XdbX7j7zsLxNip/DvlO4DW77fJ3Q43i8TacOSfQNP+B0Cgeb8OcEzg1/vl+t71RPN6GNSdwivxDtt/haxSPd5cxJ3Cq/DOeCRSP7elBU07gjVvN83/4tpjrXeFOIPy7sqrvd4U7gfCPzF+4Ewj/yPyFO4Er/wD/oZjrXeFOIPzH5R+sOIHwH59/Zccr3AmEf2T+wp1A+MfmL9sJXPUo/FPwl+oEwj8Nf6lOIPxT8JfrBJbi34J/Lk5gOf4e/pk4gat8Kf4ZO0GxP+9kOYGr/K3wL2ax73ea8Jff6x3zfreZBf8A/wycwJtCaf4B/vqdwOnwN+MEtvLtCYT/+FnU9a4gJxD+tp1A+Nt2Am8ehr9lJxD+tp1A+Nt2AuFv2wlc04K/ZScQ/radQPjbdgLhb9sJhL9tJ/CWUxXxxwlU6QRWxx8nUKMTWCF/nECFTiD8bTuBV8HftBN41bwq+eMEanMCK+aPE6jMCayaP06gLicQ/radwK+/C3/LTiD8bTuB8LftBMLfthMIf9tO4NqT8LfsBK59bQP8RewJ1uMEwt+2Ewh/204g/G07gfC37QRG5Y8TKN4JjMsfJ1C6ExiZP06gcCdwPvxNO4HzL4S/ZScwPn+cQMlOYAL+OIGCncAV/4vPHydQrhMIf9tOoAj+xxI8b/msP2cnMBH/X/W8lm4JyjJ2AlO9/n2va2n4J3ECv/Fqovf/Ro/30pL4t/J1ApPxP/0OoJK/z9YJTMd/5ALQyd/n6gQm5O9O9rSWhn8KJzAlf/f+ntbS8E/gBH7rnwn5P3T79PbX682ydAK/vSrluWxo5h9ydAIXHkl6Lr1m/n218I/rBN7233Upz9u1f4a/KCdw0Cfl7z7zMvxFOYG3fzXpefv9Exnz1+gE/uJg2vPWyJm/RiewsSHpedu6cdJ/X79qJ0CbE3j59Un5P9YIOKGinMAbkvJ/ovl9+ItyAjctT/pZ2ve9vPnrcwIbSfn/KXf++pzAw8tS8r8jd/7qnMDNX0rHf4eHvzgn8Eg6/jv71sNfnBN4ZjL+u3bttsdfvhMYEvF/5Oz1wSB/+U7guUn4P+PPudUkf/lOYDMB/30v/eVQgL9MJ7ARmf/iHz9y44qsWSt3ApfE4v+s995vWvPzq92T8HdyncCuf2vV+3BP5s5avRNorMOPnsDU/gL8K3qOeE4g/G33BMLfdk8g/I33BNrp8MUJTO8vwF9XT2D2HZ44gfCPnuntCYS/7Z7A7Dt8cQKnMr+AodHfDm6xJ2D6t4Phb/u3g+Fv+7eDxfH/u+ieuAty6wmU9/qnJzBlT6DA93/4J+wJlP75T09gUicQ/pNnOIG2+WfWEwh/8z2B8LfdEwh/2z2B8DfeEyjXCWxp/e0wnED4RzwvVpxA+Nt2AtXyxwk0zh8nsIrsQpwgnED44wTCHydQO3+cQOP8cQKN88cJhH81z2HLCYQ/TiD8x/I36QTCn55A+NMTCH96Ao3zpydQS4YTSE8gTqDtDCcQ/hGfg55AegLhLznDCTSe4QSSRXtN4QTiBOIE2uWPE4gTiBOobk8AJ5A9oUr+fziBOIE4gcb3hHECrfPHCbTNX4AT+KLsDtdEWX8trykRTiD86QmEfz38xTmB8LftBMLfthMIf9tOIPxtO4Hwt+0Ewt+2Ewh/204g/G07gfC37QTC37YTCH/nXjDsBMK/51lJXk7gIHv9OIFkOIFktZxTnEDr/HECbfOnJ9Ayf3oCjfOnJ9A4f3oCtWT0BNITSE+g7YyeQPhHfA56AukJhL/kjJ5A4xk9gWTRXlP0BPaQneh422wfW2GA4hfSE2hlT2hc/p6eQNv8PT2B8KcnEP5q9oRwAivmH3ACbfMPOIG2+QeF/HECbfPHCbTMHyfQOH+cQOP8cQLLfbYl548TKMrNS88/byfw+ETvc+I6nGvhT0+ghCxj/vQEGudPT+BUO3xq4k9PoBD+vib+9AQK4T9UE396ApXw9/x2cJY9YTiB8McJhL8c/pk5gfA37gRmxD+aE9gfZ40hxQnMhn/Q+L3j+p1AyR2+gpyASPzrdwKVdThnxl+AEziIE1Rf7wBOoGn+OIHG+eMElvtsy4U/TmC5z7b8+NMT2Mu1nSF/egKN86cn0Dh/egKn/NmWJ396AqeaZcmfnsDqZgIaj4OewApnQnX8W05MNp+aO+H/j55AXT2BVc8n6QnU1RNWNX96Am3zpydQP//p7E/QE6irJ7Dy/Ql6AlX1BEaZT9ITqN8JmB5/egJt86cnUDv/ae1P4ATq5z+t/QmcQP38pzOfxglMuOYWPZ/GCczCCSw/n8IJzMEJmsZ8EifQNn+cwJz5B5xAGWtuufNpnED9TuB01qd1O4HHneCeoP7ezrlG/vQE6uoJrJo/PYG6egJzdALpibPtBMLfuBMIf+NOID2B5p1AegJtO4H0BNp2AukJNO4ESubvcQLL35dM1QmBP04g/GPOBBQ5gfJmQjiBtvkHnMBy9yW9OIH9qpwAnMAS93U4gTiB8McJzIA/TqBx/r2vuU9MtnacW/+eMD2BcXsCU8wOtDuBOfcESudPT2DcmYt0/vQExl1zSedPT2DkNbdw/vQExp65JJgd0xMoe+YSfXZET6DomUuK2SE9gVL4B4X86QmMes8lnj89gXHvuRPsHdATKJh/iu8T0xOomb/HCVSVVc7f4wSqyjTypydQwj23bP44gbXxDziBtvkHnEBVWeX8U+wJ4gRWl2nkjxOYcCaAE4gTiBNoeU8IJ9D8niBOIPwrmh2bcQJflNwT148TSE8gTmDs9/+cewJxAlXzb+EE0hOIE1j2voSeQJzAEnvH+fbE4QTa7gnECbTdE4gTaLsnECfQ5/HbYTiBJe7r4I8TCH+cwAz44wQa548TWO6+fuK/1+9wAuvkjxOIE4gTGG/mghOIE4gTaJc/TiA9gTiBhvjjBBrnjxNonD9OIPwrmR3TE0hPID2BWfDHCYR/z7NDegJN9wSemPQamxvhGqMnUExPoK/FO6UnUExPYD3eMT2BYnoC6/GO6QkU1BNYg3dKT6CgnsAavFN6AgX1BIb03ik9gZKcwPT8cQJFOYEhwXPgBEabCdYzO8QJzNMJTPEcOIFyncAU/HEC5TqBKa4xnEC5TmCK2SFOoFwnMJl3iBMY1wkIcmeHOIFyncCE/HECo/JP8X1ynEDB/EXMDnECdTmBCb1TnMByn23KnDCcwIo/23ACJ7+36MUJPD7R2qHurD/2ug4n0Enmr2muR09gJj2BRp1AegJtO4H0BNp2ApXwxwkstydghj9OYLk9oWz44wQa548TCH+cwF7P5UDO/HEC+e1gnMCe94747WBjTiC/HWzbCeS3g407gYM4gTiBufLHCYR//bNDnECcQJzAKj/bcAInv7egJxAncMK1FPxxAuGPE6gvwwm0zR8nsNxMmJ5AnEAjMyGcQHoCcQIN88cJhD9OIPwTz3XoCSyfHZ7svM3FCcz69a9xrkdPIHOdSvnTExh1zY0TaHxdjxPIur722SFOoOS5Dk4gcx2cQLH8A05gyfW1Kiew1nU9TqBk/gnW9TiBtvnjBKrijxNonD9OYLmZsJ3v+uEE6nICNc71cAIlf9cTJ1DXnmAecx2cQNvf9cQJFMwfJ9AWf5xAXfxxAnECc5jr4ATGmwngBOIE4gSWXV/jhOEEwl/C7BAnECcQJ7D2NTdOIE4gTmAGe8I4geVmAvDHCcyBP06gcf44geVmwjiBOIE2+OME4gTiBGraE8QJxAnECcQJjDlzwQk0xR8nUBd/nECcwBzmOjiB8WYCOIE4gTiBZdfXOGE4gfCXMDvECcQJxAmsfc1tywn86yWFNcGm1TiBtpzAfZd0rwlxwkw5gYNF/k/D35gT+Erx9X/lFpxAW07gxcX3/wZOoDEncP9gYSa86HdX5MEfJ3CK2Ue69gTuM8IfJ3Aku3nT9sKe0IP/uFzkTAAnMJYT+KmuPUF/5S6JMyGcwFhO4IquPeFFV+ySORPECYzjBJ5x6NNFJ2DNybscTqC0ayyeE7jk2W4nZPMdG3ECnR0n0B/5ZHFP6MC9+6/DCTTjBA5c/3j3nuCtrcf9tTiBNpzAgRD6/nVuV0+I//gr2/0ynEALTmAIbvmObv7enRt2PrXu16/9ZpuamRBOYPms79/ndO8Jh3CNe8oNLN5UnBO6sX8vVtYvbl2fqxPo/QUHl+5OxbWnDCcwgRPo/ZBbuDU7/jiBPWXXHfqwcv44gdPL/GXP6+aPEzi97PzVx85WzR8ncJrZQ8d+9iFJ/Fs4gYl7Anfcc3yOIP4eJzB1T+DSvf/5oBz+HicwcU/gQFjinvVn5MIfJ7BM9oXn3j7TCH+cwHGz89zej50hYyaEE5iyJ/C97HJ3y10bNwiYCeAEJuwJLGQPPLD57bfu3SBuJoATGK0nsDtb6dzQO/6GR/2Y35Ooj/+CXo9jbq/n4Pxez9Xcns/zwvKMYvYEjpd9LgT3WcHfEzWXRXQCyZRksZxAMi38YzmBZDr4R3MCyTRkMZ1AMgVZTCeQTH4W1wkk05PFcQLJ1GTFC2DeqeL7A1n2WeECOOvU2JkQWd5Zc+z+0BuOzEzWeQG094eLMyGyvLNOJ3BW+/HCTIgs76zTCZzZfrwwEyLLPhu9AGYMn94f7Lw+yLLPTl8AI35I4Q+ZgWzkAvAhuKJGRGYj+z/3R6XvKv/LAgAAAABJRU5ErkJggg==',
        },
    ];
    },
    startup: function (headlessOption, url, modeOption) {
      console.log('Starting Tpae Inspector');
      var iframeDocument = window.document;
      var length = arguments.callee.caller.arguments.length;
      if (length == 0) {
        var insp = this;
        inspectorData = insp.fetchInspectorData(headlessOption);
        headlessOption = inspectorData.options.headless;
      } else {
        if (headlessOption === true) {
          var insp = this;
          inspectorData = insp.fetchInspectorData(headlessOption);
          this.history = [];
          if (this.canUseLocalStorage()) {
            (localStorage ? localStorage : window.localStorage).removeItem(
              this.dataId
            );
          }
        }
      }
      this.inherited(arguments);
      var insp = this;
      aspect.after(iframeDocument, 'showFieldError', function (arg1) {
        insp.fieldErrorClick = true;
      });
      array.forEach(this.markerEvents, function (markerEvent) {
        topic.subscribe(markerEvent, function (data) {
          if (inspectorData.recording) {
            var iframedoc = document; 
            var element = iframedoc.getElementById(data.id);
            var label = '';
            switch (markerEvent) {
              case 'maintabchange':
              case 'subtabchange':
                var currentTab = query('A.tablabelon', element)[0];
                label = insp.getChildText(currentTab);
                break;
              case 'showdialog':
              case 'hidedialog':
                label = insp.getChildText(query('label', element)[0]);
                break;
              case 'changeapp':
                label = data.app;
                break;
            }
            insp.addComment(markerEvent + ' : ' + label);
          }
        });
      });
      topic.subscribe('changeapp', function (data) {
        inspectorData.history = insp.history;
        insp.storeData();
      });
      if (inspectorData.history) {
        this.history = inspectorData.history;
      }
    },
    createInspectorWindow: function () {
      this.inherited(arguments);
      this.setButtonEnabled(
        dom.byId('insp_undoButton'),
        this.history.length !== 0
      );
    },
    processBindMethods: function () {
      var insp = this;
      if (this.bindMethods) {
        array.forEach(this.bindMethods, function (bindMethod) {
          var callout = insp.getCallout(bindMethod);
          aspect.after(
            callout[0],
            callout[1],
            function (arg1) {
              try {
                var wait = bindMethod.wait ? bindMethod.wait : 10;
                var myInsp = insp;
                window.setTimeout(function () {
                  var bindNode;
                  if (arg1) {
                    bindNode = insp.getNodeForBinding(
                      arg1.parentNode ? arg1.parentNode : arg1,
                      bindMethod
                    );
                  }
                  if (!bindNode || bindMethod.fullDoc) {
                    var iframeDocument = document;
                    var iframebody =
                      iframeDocument.getElementsByTagName('body')[0];
                    bindNode = iframebody;
                  }
                  insp.addInspectionPoints(bindNode);
                }, wait);
              } catch (error) {
                // do nothing, but don't break original functions
              }
            },
            true
          );
        });
      }
    },
    addInspectionPoints: function (searchNode) {
      if (searchNode === undefined) {
        var iframeDocument = document;
       var iframebody = iframeDocument.getElementsByTagName('body')[0];
        searchNode = iframebody;
      }
      var insp = this;
      for (index = 0; index < this.interactionElements.length; index++) {
        var interactionElement = this.interactionElements[index];
        var domElements = query(interactionElement.query, searchNode);
        domElements.forEach(function (node) {
          if (!inspectorDialog.domNode.contains(node)) {
            insp.addInspectionPoint(node, interactionElement);
          }
        });
      }
    },
    addInspectionPoint: function (node) {
      var iframedoc = document; 
      var errorPopup = iframedoc.getElementById('tt');
      var clickEvent = this.clickEvent;
      if (errorPopup && errorPopup.contains(node)) {
        this.clickEvent = 'mousedown';
      }
      this.inherited(arguments);
      this.clickEvent = clickEvent;
      errorPopup = iframedoc.getElementById('ascerr_div');
      if (errorPopup != null && errorPopup.contains(node)) {
        attr.remove(node, 'inspectorEvents');
      }
      var href = node.href;
      if (href) {
        href = href.toLowerCase();
      }
      var clickAnchor =
        (node.tagName == 'A' &&
          href &&
          href.indexOf('javascript:') === 0 &&
          href.indexOf('void(0)') == -1) ||
        attr.get(node, 'role') == 'menuitem';
      if (
        clickAnchor ||
        node['onclick'] !== null ||
        node['onmousedown'] !== null
      ) {
        if (inspectorData.options.mode == 'javascript') {
          if (
            href &&
            href.indexOf('javascript:') === 0 &&
            attr.get(node, 'hotkey')
          ) {
            attr.set(
              node,
              'href',
              'javascript: tpaeConfig.inspector.hotKey(event); ' +
                node.href.substring(11)
            );
          }
        }
      }
    },
    addCustomInspectionPoint: function (node, boundEvents) {
      var widget = registry.byId(node.id);
      var insp = this;
      var newEvents = [];
      var role = attr.get(node, 'role');
      if (node.tagName == 'INPUT' && role && role == 'combobox') {
        return true;
      }
      if (role === '' || role === null) {
        if (attr.get(node.parentNode, 'role') == 'menuitem') {
          return true;
        }
      }
      if (widget) {
        var dijitClass = widget.get('declaredClass');
        switch (dijitClass) {
          case 'ibm.tivoli.mbs.dijit.editor.TpaeTextEditor':
            var editorId = widget.id + '_iframe';
            if (array.indexOf(boundEvents, 'change') == -1) {
              aspect.after(widget, 'onChange', function () {
                var newValue = this.getValue();
                newValue = newValue.replace(RICH_TEXT_MARKER, '');
                insp.addInteraction(null, {
                  event: 'typeover',
                  id: editorId,
                  params: [newValue],
                  comment: 'Type ' + newValue + ' in the rich text editor',
                });
              });
              newEvents.push('change');
            }
            if (array.indexOf(boundEvents, 'click') == -1) {
              onEvent(
                widget.iframe.contentWindow.document.body,
                'click',
                function () {
                  insp.addInteraction(null, {
                    event: 'click',
                    id: editorId,
                    comment: 'Click the Rich Text Editor',
                  });
                  if (e) {
                    e['recorded'] = true;
                  }
                }
              );
              newEvents.push('click');
            }
            break;
        }
        return newEvents;
      }
      if (node.id.indexOf('requester_') === 0) {
        attr.set(node, { mouseEvents: 'true' });
      }
      return false;
    },
    verifyMessage: function () {
      var iframedoc = document; 
      var messageContainer = iframedoc.getElementById('titlebar_error');
      if (messageContainer) {
        var message = messageContainer.innerHTML;
        var start = message.indexOf('BMX');
        if (start >= 0) {
          var end = message.indexOf(' ', start);
          var messageId = message.substring(start, end);
          if (messageId.length > 0) {
            this.addInteractionNoCheck(null, {
              event: 'verifyMessage',
              params: [messageId],
            });
          }
        }
      }
    },
    getCurrentPageElement: function () {
      var page = document.body;
      var dialogHolder = query('#dialogholder')[0];
      var columns = dialogHolder.rows[0].cells;
      if (columns.length > 2) {
        page = columns[columns.length - 1];
      }
      return page;
    },
    hasMouseEvents: function (node) {
      if (this.inherited(arguments)) {
        return true;
      }
      var role = attr.get(node, 'role');
      if (
        role &&
        (role == 'menuitem' || role == 'checkbox' || role == 'toggleimage')
      ) {
        return true;
      }
      if (node.parentNode.tagName == 'A') {
        return true;
      }
    },
    getMenuParent: function (path, menuItem) {
      var menu = menuItem.parentNode;
      var iframedoc = document; 
      if (menu && menu.tagName == 'UL') {
        var parentItem = iframedoc.getElementById(
          attr.get(menu, 'parentitemid')
        );
        if (parentItem && parentItem.tagName == 'LI') {
          var anchor = query('a', parentItem)[0];
          if (anchor) {
            path.unshift(anchor.id);
          }
          return this.getMenuParent(path, parentItem);
        }
      }
      return path;
    },
    recordInteraction: function (e) {
      var node = this.inherited(arguments);
      if (node && e['recorded']) {
        var ev = attr.get(node, 'ev');
        if (ev == 'datelookup') {
          this.deleteInteraction(this.currentInteraction);
          this.hideNotification();
          return;
        }
        var role = attr.get(node, 'role');
        var newInteraction;
        switch (role) {
          case 'menuitem':
            var path = [];
            newInteraction = lang.clone(
              inspectorData.interactions[inspectorData.interactions.length - 1]
            );
            this.deleteInteraction(this.currentInteraction);
            var comment = newInteraction.comment;
            delete newInteraction.comment;
            newInteraction['params'] = this.getMenuParent(
              path,
              node.parentNode
            );
            newInteraction['event'] = 'clickMenu';
            newInteraction['comment'] = comment;
            this.addInteraction(e, newInteraction);
            break;
          case 'textbox':
            if (this.fieldErrorClick) {
              inspectorData.interactions[
                inspectorData.interactions.length - 1
              ].event = 'fieldErrorClick';
              newInteraction = lang.clone(
                inspectorData.interactions[
                  inspectorData.interactions.length - 1
                ]
              );
              this.deleteInteraction(this.currentInteraction);
              newInteraction['event'] = 'clickFieldError';
              this.addInteraction(e, newInteraction);
            }
            break;
        }
      }
      this.fieldErrorClick = false;
    },
    getXpath: function (node) {
      var xpath = '';
      var d = '';
      var tag = node.tagName.toUpperCase();
      switch (tag) {
        case 'PATH':
          xpath = '//' + tag.toLowerCase();
          xpath += "[d='" + attr.get(node, 'd') + "']";
          break;
      }
      return xpath;
    },
    /* used to override base node for adding inspection points when the method may not return the correct element */
    getNodeForBinding: function (bindObject, bindMethod) {
      switch (bindMethod.method) {
        case 'fillNavSection':
          var iframedoc = document;
          return iframedoc.getElementById(bindObject.menu.id);
      }
      return this.inherited(arguments);
    },
    // Comment Code Below

    getComment: function (type, e, node) {
      if (!e && !node) {
        return '';
      }
      node = node ? node : e.target;
      var iframedoc = document; 
      switch (type) {
        case 'change':
          if (node.id.match('quicksearch'))
            var comment = 'Type ' + node.value + ' in the quicksearch field';
          else if (node.id.indexOf('tdrow') > 0) {
            var nodeArray = node.id.split('_');
            var parentID = nodeArray[0] + '_ttrow_' + nodeArray[2] + '-c';
            var parentNode = dom.byId(parentID);
            var comment =
              'Type ' +
              node.value +
              ' in the ' +
              parentNode.innerText +
              'field';
          } else if (node.id.indexOf('tfrow') == -1) {
            var newString = node.id.split('-');
            var parentID = newString[0] + '-lb';
            var parentNode = dom.byId(parentID);
            var labelName = parentNode.innerText.replace(/:/g, '');
            if (newString[1] == 'tb2') labelName = labelName + ' Description';
            var comment =
              'Type ' + node.value + ' in the ' + labelName + ' field';
          } else {
            var parentID = node.id.replace(/tfrow/g, 'ttrow');
            var parentID = parentID.replace(/txt-tb/g, 'ttitle-lb');
            var parentNode = dom.byId(parentID);
            var labelName = parentNode.innerHTML;
            var comment =
              'Type ' + node.value + ' in the ' + labelName + ' filter field';
          }
          break;
        case 'keydown':
          var key = this.getKey(
            node,
            e.keyCode,
            (e.ctrlKey ? 'CTRL' : '') +
              (e.altKey ? 'ALT' : '') +
              (e.shiftKey ? 'SHIFT' : '')
          );
          if (node.id.indexOf('tfrow') == -1) {
            var newString = node.id.split('-');
            var parentID = newString[0] + '-lb';
            var parentNode = dom.byId(parentID);
            var labelName = parentNode.innerText.replace(/:/g, '');
            if (newString[1] == 'tb2') labelName = labelName + ' Description';
            var comment =
              'Press the ' + key + ' key in the ' + labelName + ' field';
          } else {
            var parentID = node.id.replace(/tfrow/g, 'ttrow');
            var parentID = parentID.replace(/txt-tb/g, 'ttitle-lb');
            var parentNode = iframedoc.getElementById(parentID);
            var labelName = parentNode.innerHTML;
            var comment =
              'Press the ' + key + ' key in the ' + labelName + ' filter field';
          }
          break;
        case 'click':
          if (node.tagName.match('IMG')) {
            var role = attr.get(node, 'role');
            try {
              role.match('button');
              {
                var imageNameAlt = node.alt;
                if (imageNameAlt === '' && node.id.indexOf('tt') != -1) {
                  var parentID1 = node.id.substr(0, node.id.length - 3);
                  var parentID = parentID1.replace(/_ttxt-lb/g, '-c');
                  var parentNode = iframedoc.getElementById(parentID);
                  var recordName = parentNode.innerText;
                  if (recordName === '') recordName = parentNode.value;
                  var comment = 'Click the tooltip marker for ' + recordName;
                } else {
                  var imageNameAlt2 = imageNameAlt.split('    ');
                  var imageName = imageNameAlt2[0];
                  var comment = 'Click the ' + imageName + ' toolbar button';
                }
              }
            } catch (ex) {
              if (node.id.indexOf('cb_img') > 0) {
                var newString = node.id.split('-');
                var parentID = newString[0] + '-lb';
                var parentNode = iframedoc.getElementById(parentID);
                var labelName = parentNode.innerText.replace(/:/g, '');
                if (newString[1] == 'tb2')
                  labelName = labelName + ' Description';
                var comment = 'Click the ' + labelName + ' checkbox';
              } else if (node.id.indexOf('checkbox-cb') > 0) {
                var newString = node.id.split('_');
                var parentID =
                  newString[0] + '_ttrow_' + newString[2] + '_ttitle-lb';
                var parentNode = iframedoc.getElementById(parentID);
                var labelName = parentNode.innerText.replace(/:/g, '');
                var rowNum = newString[3].split(':');
                var optionName =
                  newString[0] +
                  '_' +
                  newString[1] +
                  '_' +
                  '[C:1]-c[R:' +
                  rowNum[1];
                var option = iframedoc.getElementById(optionName);
                var optionText = option.innerText;
                if (optionText === '  ' || optionText === '')
                  var comment = 'Click the ' + labelName + ' checkbox ';
                else
                  var comment =
                    'Click the ' + labelName + ' checkbox for ' + optionText;
              } else if (node.id.indexOf('dropdown') > 0) {
                var comment = 'Click the ' + node.alt;
              } else if (node.id.indexOf('action-img') > 0) {
                var comment = 'Click the Select Action menu';
              } else if (node.id.indexOf('ttselrows-ti_img') > 0) {
                var spanID = node.id.replace('img', 'label');
                var spanNode = dom.byId(spanID);
                var currNodeID = node.id.split('_');
                var parentID = currNodeID[0] + '-lb';
                var parentNode = iframedoc.getElementById(parentID);
                var comment =
                  'Click the ' +
                  spanNode.innerText +
                  ' checkbox in the ' +
                  parentNode.innerText +
                  ' table';
              } else if (node.id.indexOf('tdrmock') > 0) {
                var imageName = node.title;
                var currNodeID = node.id.split('_');
                var rowCount = currNodeID[2].split(':');
                var rowNum = rowCount[1].replace(/]/g, '');
                var parentID = currNodeID[0] + '-lb';
                var parentNode = dom.byId(parentID);
                var actualRow = parseInt(rowNum) + 1;
                var comment =
                  'Click the ' +
                  node.title +
                  ' checkbox for row ' +
                  actualRow +
                  ' in the ' +
                  parentNode.innerText +
                  ' table';
              } else {
                var imageName = node.title;
                var num = node.id.indexOf('lookup_page');
                if (node.id.indexOf('ttrow') > 0) {
                  var comment = 'Click the ' + node.title + ' image';
                } else if (node.id.indexOf('lookup_page') >= 0) {
                  var comment =
                    'Click the ' +
                    node.title +
                    ' image on the Select Value dialog';
                } else if (node.id.indexOf('tdrow') == -1) {
                  var newString = node.id.split('-');
                  var parentID = newString[0] + '-lb';
                  var parentNode = dom.byId(parentID);
                  if (parentNode === null)
                    var comment = 'Click the ' + imageName + ' image';
                  else {
                    var labelName = parentNode.innerText.replace(/:/g, '');
                    if (imageName.indexOf('image') > 0)
                      imageName = imageName.replace(/image/g, '');
                    if (parentNode.className.indexOf('ttit') == -1)
                      var comment =
                        'Click the ' +
                        imageName +
                        ' image for the ' +
                        labelName +
                        ' field';
                    else
                      var comment =
                        'Click the ' +
                        imageName +
                        ' image in the ' +
                        labelName +
                        ' table';
                  }
                } else {
                  var currNodeID = node.id.split('_');
                  var rowCount = currNodeID[3].split(':');
                  var rowNum = rowCount[1].replace(/]/g, '');
                  var parentID = currNodeID[0] + '-lb';
                  var parentNode = dom.byId(parentID);
                  if (parentNode == null)
                      var innerText = "";
                  else
                      var innerText = parentNode.innerText;
                  var actualRow = parseInt(rowNum) + 1;
                  var comment =
                    'Click the ' +
                    imageName +
                    ' image for row ' +
                    actualRow +
                    ' in the ' +
                    innerText +
                    ' table';
                }
              }
            }
          } else if (node.tagName.match('A')) {
            var role = attr.get(node, 'role');
            try {
              if (role.match('tab')) {
                var tabName = node.innerText;
                var comment = 'Click the ' + tabName + ' tab';
              } else if (role.match('menuitem')) {
                var menuitem = node.innerText;
                var comment = 'Click the ' + menuitem + ' menuitem';
              } else if (role.match('button')) {
                var buttonName = node.innerText;
                var comment = 'Click the ' + buttonName + ' button';
              }
            } catch (ex) {
              var linkName = node.textContent;
              if (linkName.indexOf(':') > 0) {
                var linkTitle = node.title;
                var title = linkTitle.split(':');
                linkName = title[0];
                var comment = 'Click the ' + linkName + ' link';
              } else if (node.id.indexOf('ttxt-lb') == -1) {
                var title = node.title;
                if (title === '')
                  var comment = 'Click the ' + node.textContent + ' link';
                if (node.tagName.toLowerCase() === 'a')
                    var comment = 'Click the ' + title + ' link'
                else var comment = 'Click the ' + title + ' image';
              } else var comment = 'Click the link for record ' + linkName;
            }
          } else if (node.tagName.match('BUTTON')) {
            var type = attr.get(node, 'ctype');
            try {
              if (type.match('pushbutton')) {
                var buttonName = node.innerText;
                var splitID = node.id.split('_');
                var tableID = splitID[0] + '-lb';
                var tableHeader = dom.byId(tableID);
                if (tableHeader === null)
                  var comment =
                    'Click the ' + buttonName + ' button in the dialog';
                else
                  var comment =
                    'Click the ' +
                    buttonName +
                    ' button in the ' +
                    tableHeader.innerText +
                    ' table';
              }
            } catch (ex) {
              var buttonName = node.title;
              if (buttonName.indexOf('ALT') != -1) buttonName = node.outerText;
              if (buttonName === '') buttonName = node.textContent;
              var comment = 'Click the ' + buttonName + ' button';
            }
          } else if (node.tagName.match('DIV')) {
            var name = node.innerText;
            var linkName = name.replace(/ _/g, '');
            var comment = 'Click the ' + linkName + ' link';
          } else if (node.tagName.match('INPUT')) {
            if (node.id.indexOf('quicksearch') >= 0)
              var comment = 'Click the ' + node.title + ' image';
            else if (node.id.indexOf('-rb') > 0) {
              var newString = node.id.split('-');
              var parentID = newString[0] + '-lb1';
              var parentNode = dom.byId(parentID);
              if (parentNode !== null)
                var labelName = parentNode.innerText.replace(/:/g, '');
              var comment = 'Click the ' + labelName + ' radio button';
            } else if (node.id.indexOf('tdrow') > 0) {
              var nodeArray = node.id.split('_');
              var parentID = nodeArray[0] + '_ttrow_' + nodeArray[2] + '-c';
              var parentNode = dom.byId(parentID);
              var comment = 'Click the ' + parentNode.innerText + ' field';
            } else if (node.id.indexOf('tfrow') == -1) {
              var newString = node.id.split('-');
              var parentID = newString[0] + '-lb';
              var parentNode = dom.byId(parentID);
              if (parentNode !== null)
                var labelName = parentNode.innerText.replace(/:/g, '');
              if (newString[1] == 'tb2') labelName = labelName + ' Description';
              var comment = 'Click the ' + labelName + ' field';
            } else {
              var parentID = node.id.replace(/tfrow/g, 'ttrow');
              var parentID = parentID.replace(/txt-tb/g, 'ttitle-lb');
              var parentNode = dom.byId(parentID);
              var labelName = parentNode.innerHTML;
              var comment = 'Click the ' + labelName + ' filter field';
            }
          } else if (node.tagName.match('TD')) {
            var buttonName = node.innerText;
            var splitID = node.id.split('_');
            var tableID = splitID[0] + '-lb';
            var tableHeader = dom.byId(tableID);
            var comment =
              'Click ' +
              node.innerText +
              ' in the ' +
              tableHeader.innerText +
              ' table';
          }
          break;
        default:
          if (node.id.indexOf('requester_') === 0) {
            return (
              node.tagName +
              ' [' +
              attr.get(node, 'aria-label') +
              '] - Dialog[Requestor] '
            );
          }
          if (node.tagName.toUpperCase() == 'PATH') {
            var parent = node.parentNode;
            while (parent && !domClass.contains(parent, 'pbt')) {
              parent = parent.parentNode;
            }

            return (
              'PATH: ' +
              query('label', parent)[0].innerHTML +
              " d='" +
              attr.get(node, 'd') +
              "'"
            );
          }
          return (
            this.findControlLabel(node) +
            ' ' +
            this.findComponentLabel(node) +
            ' - ' +
            this.findPageLabel(node) +
            ' ' +
            this.findTableLabel(node)
          );
          break;
      }
      return comment;
    },
    findTableLabel: function (node) {
      //find table if there is one
      try {
        var tableWalk = node;
        var className = attr.get(tableWalk, 'class');
        while (
          tableWalk &&
          (!className || className.indexOf('tableouter') == -1)
        ) {
          tableWalk = tableWalk.parentNode;
          if (tableWalk) {
            className = attr.get(tableWalk, 'class');
          }
        }
        if (tableWalk) {
          return 'Table[' + this.findLabel(tableWalk) + ']';
        }
      } catch (error) {
        error['additional'] = 'Error in :' + arguments.callee.nom;
        throw error;
      }
      return '';
    },
    findComponentLabel: function (node) {
      try {
        var label = ''; //this.findLabel(node);
        var title = attr.get(node, 'title');
        var alt = attr.get(node, 'alt');
        var ariaLabel = attr.get(node, 'aria-label');
        var labeledBy = attr.get(node, 'aria-labelledby');

        if (labeledBy && dom.byId(labeledBy)) {
          labeledBy = this.getChildText(
            dom.byId(labeledBy),
            true
          );
        }
        var extra = '';
        if (node.tagName != 'INPUT') {
          extra = title
            ? title
            : alt
            ? alt
            : ariaLabel
            ? ariaLabel
            : labeledBy
            ? labeledBy
            : '';
          if (extra.trim() == label.trim()) {
            extra = '';
          }
        }

        var compType = '';
        if (attr.get(node, 'ctype')) {
          compType = attr.get(node, 'ctype');
        }
        if (!compType || compType === '') {
          compType = attr.get(node, 'role');
          while (compType === '' && attr.get(node, 'control') === null) {
            node = node.parentNode;
            compType = attr.get(node, 'role');
            if (compType === null) {
              compType = '';
            }
          }
        }
        if (compType && compType.trim().length > 0) {
          var parent = node.parentNode;
          var checkNode = node;
          if (parent.tagName == 'LI') {
            checkNode = parent;
            parent = parent.parentNode;
          }
          var matchingTypes = query(
            checkNode.tagName + "[ctype='" + compType + "']",
            parent
          );
          if (matchingTypes.length > 1) {
            if (compType == 'textbox') {
              if (matchingTypes.indexOf(checkNode) === 0) {
                compType += '';
              } else {
                compType = '[Description]' + compType;
              }
            } else {
              compType += '[' + matchingTypes.indexOf(checkNode) + ']';
            }
          }
        }
        if (compType) {
          label = compType;
        }
        if (label.trim().length > 0) {
          label = '[' + label + ']';
        }
        return label;
      } catch (error) {
        error['additional'] = 'Error in :' + arguments.callee.nom;
        throw error;
      }
      return '';
    },
    findMenuLabel: function (node) {
      var menu = node.parentNode.parentNode;
      var menuLabel = '';

      while (
        attr.get(menu, 'static') != 'true' &&
        attr.get(menu, 'parentmenuid')
      ) {
        var menuAnchor = query(
          'A',
          dom.byId(attr.get(menu, 'parentitemid'))
        )[0];
        if (menuAnchor) {
          menuLabel += this.getChildText(menuAnchor) + ' - ';
        }
        menu = dom.byId(attr.get(menu, 'parentmenuid'));
      }
      if (menu && attr.get(menu, 'static') === true) {
        if (attr.get(menu, 'aria-labelledby')) {
          var labelElement = iframedoc.getElementById(
            attr.get(menu, 'aira-labelledby')
          );
          if (labelElement) {
            menuLabel += this.getChildText(labelElement);
          }
        }
        menuLabel = menuLabel.length > 0 ? menuLabel : attr.get(menu, 'title');
        if (!menuLabel || menuLabel.trim().length === 0) {
          menuLabel = '';
        } else {
          menuLabel += ' - ';
        }
      }
      return ' Menu[' + menuLabel + ' - ' + this.findComponentLabel(node) + ']';
    },
    findControlLabel: function (node) {
      var iframedoc = document; 
      try {
        if (node.tagName == 'IMG' && node.parentNode.tagName == 'BUTTON') {
          node = node.parentNode;
        }
        var role = attr.get(node, 'role');
        if (role && role == 'menuitem') {
          return this.findMenuLabel(node);
        }
        if (node.parentNode) {
          role = attr.get(node.parentNode, 'role');
          if (role && role == 'menuitem') {
            return this.findMenuLabel(node.parentNode);
          }
        }

        var headers = attr.get(node, 'headers');
        if (!headers && node.parentNode) {
          //may be inside of a column
          headers = attr.get(node.parentNode, 'headers');
          if (headers) {
            if (headers.indexOf(' ') >= 0) {
              return 'Column[' + this.getChildText(node) + '] ';
            }
            node = node.parentNode;
          } else if (attr.get(node.parentNode, 'class').indexOf('tc') > -1) {
            headers = node.id;
            node = node.parentNode;
          } else if (
            attr.get(node.parentNode.parentNode, 'class').indexOf('tc') > -1
          ) {
            headers = node.id;
            node = node.parentNode.parentNode;
          }
        }
        if (headers) {
          //on a tablecell
          var stringsplit = node.id.split(':');
          var sel1 = stringsplit[0].split(']');
          var row = sel1[0];
          if (!isNaN(row)) {
            row = 'Row[' + row + '] ';
          } else {
            if (node.id.indexOf('tfrow') > -1) {
              row = 'Row[filter] ';
            } else if (node.id.indexOf('ttrow') > -1) {
              row = 'Row[title] ';
            } else {
              row = '';
            }
          }
          var searchEl = iframedoc.getElementById(headers);
          if (!searchEl && headers.indexOf(' ') > 0) {
            searchEl = node;
          }
          return row + 'Column[' + this.findLabel(searchEl) + ']';
        }

        var controlId = node.id.substring(0, node.id.indexOf('-'));
        var verticalLabelRow = iframedoc.getElementById(controlId + '-co_0');
        if (verticalLabelRow && node.parentNode) {
          var nodeRow = node.parentNode.parentNode;
          if (nodeRow.tagName == 'TR') {
            var table = verticalLabelRow.parentNode;
            var myRow = table.rows[verticalLabelRow.rowIndex + 1];
            if (myRow === undefined)
              myRow = table.rows[verticalLabelRow.rowIndex];
            if (myRow.contains(node)) {
              var parentLabel = this.findLabel(verticalLabelRow);
              if (parentLabel.length > 0) {
                parentLabel = 'Control[' + parentLabel + ']';
              }
              return parentLabel; // +childValue;
            }
          }
        }
        if (
          node.tagName == 'A' ||
          node.tagName == 'SPAN' ||
          node.tagName == 'DIV' ||
          node.tagName == 'IMG' ||
          node.tagName == 'BUTTON'
        ) {
          return 'Control[' + this.getChildText(node) + ']';
        }
      } catch (error) {
        error['additional'] = 'Error in :' + arguments.callee.nom;
        throw error;
      }
      return '';
    },
    findPageLabel: function (node) {
      try {
        var parent = node;
        var role = attr.get(parent, 'role');
        var tabHierarchy = '';
        while (parent && role != 'alert' && role != 'dialog') {
          parent = parent.parentNode;
          if (attr.get(parent, 'class').indexOf('tabg') > -1) {
            var currentTab = query("a[role='tab'].on", parent)[0];
            if (currentTab) {
              if (tabHierarchy.length > 0) {
                tabHierarchy += ' - ';
              }
              tabHierarchy = attr.get(currentTab, 'title');
            }
          }
          if (!parent || parent.tagName == 'BODY') {
            break;
          }
          role = attr.get(parent, 'role');
        }
        if (parent) {
          if (tabHierarchy.length > 0) {
            tabHierarchy = '\n Tab[' + tabHierarchy + '] ';
          }
          if (parent.tagName == 'BODY') {
            return '\n Page[' + document.title + '] ' + tabHierarchy;
          }
          var pageLabel = this.findLabel(parent);
          if (pageLabel.length > 0) {
            return '\n Dialog[' + pageLabel + '] ' + tabHierarchy;
          }
        }
      } catch (error) {
        error['additional'] = 'Error in :' + arguments.callee.nom;
        throw error;
      }
      return '';
    },
    findLabel: function (node) {
      try {
        var labels = query('label', node);
        var title = '';
        if (
          labels.length > 0 &&
          attr.get(node, 'class') == 'tableouter' &&
          attr.get(labels[0], 'class').indexOf('ttit') == -1
        ) {
          //need to walk up to dialog? for the label
          var parentNode = node;
          while (parentNode && attr.get(parentNode, 'role') != 'dialog') {
            parentNode = parentNode.parentNode;
          }
          if (attr.get(parentNode, 'role') == 'dialog') {
            labels = query('label', parentNode);
          }
        }
        if (labels.length > 0 && attr.get(labels[0], 'class').indexOf('ttit')) {
          title += this.getChildText(labels[0]);
          if (
            node.tagName == 'LABEL' ||
            node.tagName == 'SPAN' ||
            node.tagName == 'INPUT' ||
            node.tagName == 'TEXTAREA'
          ) {
            title += title.trim();
            title +=
              (title.lastIndexOf(':') != title.length - 1 ? ' ' : ' ') +
              this.getChildText(node);
          }
          return (
            title + (attr.get(node, 'class') == 'tableouter' ? ' Table: ' : '')
          );
        }
        return this.getChildText(node);
      } catch (error) {
        error['additional'] = 'Error in :' + arguments.callee.nom;
        throw error;
      }
      return '';
    },
    getChildText: function (node, val) {
      if (!node) {
        return '';
      }
      var childNodes = node.childNodes;
      var text = '';
      array.forEach(childNodes, function (child) {
        if (child.nodeType == 3) {
          text = child.data;
        }
      });
      if (text.trim().length === 0) {
        var element = dojo.query('span', node);
        if (element.length === 0) {
          element = dojo.query('label', node);
        }
        if (element.length > 0) {
          text = this.getChildText(element[0]);
          if (text.trim().length > 0 && attr.get(node, 'role') != 'menuitem') {
            if (text.length > 20) {
              text = text.substring(0, 20) + '...';
            }
            if (!val) {
              return text;
            }
            return ' Value[' + text + ']';
          }
        } else {
          var title = attr.get(node, 'title');
          return title && title.trim().length > 0
            ? title
            : attr.get(node, 'alt');
        }
      }
      return text;
    },
    getTitlebarMessage: function () {
      var insp = this;
      titlebarDialog = new insp.InspectorDialog({
        id: 'insp_DataDialog',
        title: insp.resources.strings.get_titlebar_message,
        content:
          '<div class="notification" id ="insp_makeVariable_info" style="text-align: center; height: 20px;">&nbsp;</div>' +
          '	<div class="insp_d_content">' +
          '		<label for="insp_variableName"><span style="color:orange">* </span>' +
          insp.resources.strings.variable_name +
          '</label><br>' +
          '		<input type="text" id="insp_variableName" size="20" /><br><br>' +
          '		<label for="insp_messageId"><span style="color:orange">* </span>' +
          this.resources.strings.titlebar_message +
          '</label><br>' +
          '		<input type="text" id="insp_messageId" size="50" readonly style="background-color: #e7e7e7; border: 1px solid #999; margin-right: 10px"/>' +
          '		<button id="insp_addVariableButton" data-method="addVariable" style="vertical-align:middle; margin: 0px 5px; padding: 3px;" height: 22px; width: 22px ><img style="margin: 0px" width="18" height="18" title="" alt="" src="' +
          insp.resources.images.add +
          '" /></button>' +
          '		<input type="hidden" id="insp_dataId" size="20" />' +
          '    </div>' +
          ' 	<div class="inspectorToolbar" style="text-align:' +
          insp.reverseAlign +
          '">' +
          '		<button id="insp_titlebarDoneButton" data-method="cancel">' +
          insp.resources.strings.done +
          '</button>&nbsp;' +
          '	</div>',
        onHide: function () {
          titlebarDialog.destroyRecursive(false);
          Dialog._DialogLevelManager.hide(titlebarDialog);
          style.set(registry.byId('insp_inspectorDialog').domNode, {
            display: '',
          });
        },
        onShow: function () {
          inspectorData.dialogPosition = geom.position(this.domNode);
          insp.storeData();
        },
        wasRecording: inspectorData.recording,
        closable: true,
        autofocus: true,
        refocus: false,
      });
      insp.processSimpleDialogButtons(titlebarDialog);
      onEvent(dom.byId('insp_variableName'), 'keyup, change', function (e) {
        insp.validateVariable();
      });
      onEvent(dom.byId('insp_messageId'), 'keyup, change', function () {
        insp.validateVariable();
      });
      style.set(titlebarDialog.containerNode, { padding: '0px' });
      titlebarDialog.show();
      insp.validateVariable();
      insp.centerDialogOnParent(titlebarDialog, inspectorDialog);
      var underlay = dom.byId('insp_DataDialog_underlay');
      style.set(underlay, { background: 'transparent' });
      var tbtext = dom.byId("titlebar_error");
      var message = tbtext.innerHTML;
      message = message.replace(/&nbsp;/g, '');
      dom.byId('insp_messageId').value = message;
      dom.byId('insp_dataId').value = 'titlebar_error';
      dom.byId('insp_variableName').focus();
    },
    getSystemMessage: function () {
      var insp = this;
      var iframedoc = document;
      var systext = iframedoc.getElementById('mb_msg');
      if (!systext) {
        alert('No system message found');
        return;
      }
      systemMsgDialog = new insp.InspectorDialog({
        id: 'insp_DataDialog',
        title: insp.resources.strings.get_system_message,
        content:
          '<div class="notification" id ="insp_makeVariable_info" style="text-align: center; height: 20px;">&nbsp;</div>' +
          '	<div class="insp_d_content">' +
          '		<label for="insp_variableName"><span style="color:orange">* </span>' +
          insp.resources.strings.variable_name +
          '</label><br>' +
          '		<input type="text" id="insp_variableName" size="20" /><br><br>' +
          '		<label for="insp_messageId"><span style="color:orange">* </span>' +
          this.resources.strings.system_message +
          '</label><br>' +
          '		<input type="text" id="insp_messageId" size="50" readonly style="background-color: #e7e7e7; border: 1px solid #999; margin-right: 10px"/>' +
          '		<button id="insp_addVariableButton" data-method="addVariable" style="vertical-align:middle; margin: 0px 5px; padding: 3px;" height: 22px; width: 22px ><img style="margin: 0px" width="18" height="18" title="" alt="" src="' +
          insp.resources.images.add +
          '" /></button>' +
          '		<input type="hidden" id="insp_dataId" size="20" />' +
          '    </div>' +
          ' 	<div class="inspectorToolbar" style="text-align:' +
          insp.reverseAlign +
          '">' +
          '		<button id="insp_titlebarDoneButton" data-method="cancel">' +
          insp.resources.strings.done +
          '</button>&nbsp;' +
          '	</div>',
        onHide: function () {
          systemMsgDialog.destroyRecursive(false);
          Dialog._DialogLevelManager.hide(systemMsgDialog);
          style.set(registry.byId('insp_inspectorDialog').domNode, {
            display: '',
          });
        },
        onShow: function () {
          inspectorData.dialogPosition = geom.position(this.domNode);
          insp.storeData();
        },
        wasRecording: inspectorData.recording,
        closable: true,
        autofocus: true,
        refocus: false,
      });
      insp.processSimpleDialogButtons(systemMsgDialog);
      {
        onEvent(dom.byId('insp_variableName'), 'keyup, change', function (e) {
          insp.validateVariable();
          insp.validateRandom();
        });
        onEvent(dom.byId('insp_dataId'), 'keyup, change', function () {
          insp.validateVariable();
          insp.validateRandom();
        });
      }
      var message = systext.innerHTML;
      style.set(systemMsgDialog.containerNode, { padding: '0px' });
      systemMsgDialog.show();
      insp.validateVariable();
      insp.centerDialogOnParent(systemMsgDialog, inspectorDialog);
      var underlay = dom.byId('insp_DataDialog_underlay');
      style.set(underlay, { background: 'transparent' });
      message = message.replace(/&nbsp;/g, '');
      dom.byId('insp_messageId').value = message;
      dom.byId('insp_dataId').value = 'mb_msg';
      dom.byId('insp_variableName').focus();
    },
    addVariable: function () {
      var insp = this;
      if (insp.validateVariable()) {
        var variable = dom.byId('insp_variableName').value;
        insp.varNames.push(variable);
        var id = dom.byId('insp_dataId').value;
        var note = insp.updateParams(insp.resources.strings.variable_created, [
          "<span class='variable'>" + variable + '</span>',
          id,
        ]);
        insp.addInteractionNoCheck(null, {
          event: 'makeVariable',
          id: id,
          params: [variable],
          comment: note,
        });
        insp.showNotification(note, 0);
        dom.byId('insp_variableName').value = '';
        dom.byId('insp_dataId').value = '';
      }
    },
    setGotoApp: function () {
      var insp = this;
      goToAppDialog = new insp.InspectorDialog({
        id: 'insp_gotoDialog',
        title: insp.resources.strings.set_go_to_app,
        content:
          '<div class="insp_d_content">' +
          '	<label for="insp_gotoapp"><span style="color:orange">* </span>' +
          this.resources.strings.application +
          '</label><br>' +
          '	<input type="text" id="insp_gotoapp" size="25"/><br>' +
          '	</div>' +
          ' 	<div class="inspectorToolbar" style="text-align:' +
          reverseAlign +
          '">' +
          '		<button id="insp_addGoToAppButton" data-method="addGoToApp"">' +
          insp.resources.strings.add +
          '</button>&nbsp;' +
          '		<button id="insp_cancelGoToAppButton" data-method="cancel">' +
          insp.resources.strings.cancel +
          '</button>&nbsp;' +
          '	</div>',
        onHide: function () {
          goToAppDialog.destroyRecursive(false);
          Dialog._DialogLevelManager.hide(goToAppDialog);
        },
        onShow: function () {
          Dialog._DialogLevelManager.show(goToAppDialog);
        },
        autofocus: true,
        refocus: false,
      });
      insp.processSimpleDialogButtons(goToAppDialog);
      style.set(goToAppDialog.containerNode, { padding: '0px' });
      goToAppDialog.show();
      insp.centerDialogOnParent(goToAppDialog, inspectorDialog);
    },
    addGoToApp: function () {
      var insp = this;
      var appName = dom.byId('insp_gotoapp').value;
      insp.varNames.push(appName);
      insp.addInteractionNoCheck(null, { event: 'gotoApp', app: appName });
      goToAppDialog.hide();
    },
    setCheckboxState: function () {
      var insp = this;
      checkboxDialog = new insp.InspectorDialog({
        id: 'insp_DataDialog',
        title: insp.resources.strings.set_checkbox_state,
        content:
          '' +
          '<div class="notification" id="insp_makeVariable_info" style="text-align: center;height: 20px;">&nbsp;</div>' +
          '<div id="insp_checkbox" style="padding:10px">' +
          '				<label for="insp_dataId"><span style="color:orange">* </span>' +
          insp.resources.strings.field_id +
          '</label><br>' +
          '				<input type="text" id="insp_dataId" size="30" readonly style="background-color: #e7e7e7; border: 1px solid #999; margin-right: 10px"/>' +
          '</div>' +
          '<div class="insp_d_content">' +
          '	<label for="insp_checkboxstate"><span style="color:orange">* </span>' +
          this.resources.strings.checkbox_state +
          '</label><br>' +
          '		<input type="radio" id="rb_checked" name="checked" value="ckd" checked>' +
          this.resources.strings.checked +
          '</input>&nbsp;' +
          '		<input type="radio" id="rb_unchecked" name = "checked" value="unckd">' +
          this.resources.strings.unchecked +
          '</input><br><br>' +
          '<label for="insp_checkboxComment">' +
          insp.resources.strings.comment +
          '</label><br>' +
          '<input type="text" id="insp_checkboxComment" style="width: 300px" />' +
          '</div>' +
          '<div class="inspectorToolbar" style="text-align:' +
          reverseAlign +
          '">' +
          '		<button id="insp_addCheckedButton" data-method="addCheckboxState">' +
          insp.resources.strings.add +
          '</button>&nbsp;' +
          '		<button id="insp_doneCheckedButton" data-method="cancel">' +
          insp.resources.strings.done +
          '</button>&nbsp;' +
          '	</div>',
        onHide: function () {
          checkboxDialog.destroyRecursive(false);
          Dialog._DialogLevelManager.hide(checkboxDialog);
        },
        onShow: function () {
          Dialog._DialogLevelManager.show(checkboxDialog);
        },
        autofocus: true,
        refocus: false,
      });
      insp.processSimpleDialogButtons(checkboxDialog);
      style.set(checkboxDialog.containerNode, { padding: '0px' });
      checkboxDialog.show();
      var underlay = dom.byId('insp_DataDialog_underlay');
      style.set(underlay, { background: 'transparent' });
      insp.centerDialogOnParent(checkboxDialog, inspectorDialog);
      onEvent(underlay, 'mousemove', function (e) {
        insp.removeHighlights();
        style.set(this, { display: 'none' });
        var node = document.elementFromPoint(e.clientX, e.clientY);
        style.set(this, { display: '' });
        if (node != insp.assertHighlight && node.tagName == 'IMG') {
          insp.highlightHover = node;
          insp.addHighlight(node, '2px solid blue');
        }
      });
      this.clickHandler = onEvent(underlay, 'mousedown', function (e) {
        style.set(this, { display: 'none' });
        var node = document.elementFromPoint(e.clientX, e.clientY);
        style.set(underlay, { display: '' });
        e.cancelBubble = true;
        e.preventDefault();
        if (
          node.tagName == 'DIV' &&
          node.className === 'maximo-toggle-button'
        ) {
          dom.byId('insp_dataId').value = node.id;
        }
      });
    },
    setCheckboxElement: function (node) {
      if (!node.id) {
        insp.missingId(null, node);
        insp.showNotification(insp.resources.strings.missing_id, 1);
        return;
      }
      if (insp.assertHighlight) {
        insp.removeHighlights();
        onEvent.emit(insp.assertHighlight, 'mouseout', {
          cancelable: false,
          bubbles: true,
        });
        insp.assertHighlight = null;
      }
      insp.addHighlight(node, '2px solid red');
      insp.assertHighlight = node;
    },
    addCheckboxState: function () {
      var insp = this;
      var id = dom.byId('insp_dataId').value;
      var state = null;
      var rbChecked = dom.byId('rb_checked').checked;
      if (rbChecked) state = 'true';
      var rbUnchecked = dom.byId('rb_unchecked').checked;
      if (rbUnchecked) state = 'false';
      var commentValue = '';
      var comment = dom.byId('insp_checkboxComment');
      if (comment) {
        commentValue = comment.value;
      }
      if (commentValue.trim().length === 0) {
        commentValue = 'Set checkbox state to ' + state + ' for node ' + id;
      }
      var note = insp.updateParams(
        this.resources.strings.checkbox_state_added,
        [id]
      );
      insp.showNotification(note, 0);
      insp.centerDialogOnParent(checkboxDialog, inspectorDialog);
      insp.addInteractionNoCheck(null, {
        event: 'selectCheckbox',
        id: id,
        params: [state],
        comment: commentValue,
        eventType: 'click',
      });
      dom.byId('insp_dataId').value = '';
      dom.byId('insp_checkboxComment').value = '';
      var message = this.resources.strings.checkbox_added_success;
      insp.showNotification(
        message + ' ' + (parseInt(insp.currentInteraction) + 1),
        0
      );
    },
    clickSubmitAndOpenReport: function () {
      var insp = this;
      submitAndOpenDialog = new insp.InspectorDialog({
        id: 'insp_DataDialog',
        title: insp.resources.strings.click_submit_and_open_report,
        content:
          '' +
          '<div class="notification" id="insp_makeVariable_info" style="text-align: center;height: 20px;">&nbsp;</div>' +
          '<div id="insp_submit" style="padding:10px">' +
          '				<label for="insp_dataId"><span style="color:orange">* </span>' +
          insp.resources.strings.button_id +
          '</label><br>' +
          '				<input type="text" id="insp_dataId" size="30" readonly style="background-color: #e7e7e7; border: 1px solid #999; margin-right: 10px"/>' +
          '</div>' +
          '</div>' +
          '<div class="inspectorToolbar" style="text-align:' +
          reverseAlign +
          '">' +
          '		<button id="insp_addCheckedButton" data-method="addSubmitAndOpen">' +
          insp.resources.strings.add +
          '</button>&nbsp;' +
          '		<button id="insp_doneCheckedButton" data-method="cancel">' +
          insp.resources.strings.done +
          '</button>&nbsp;' +
          '	</div>',
        onHide: function () {
          submitAndOpenDialog.destroyRecursive(false);
          Dialog._DialogLevelManager.hide(submitAndOpenDialog);
        },
        onShow: function () {
          Dialog._DialogLevelManager.show(submitAndOpenDialog);
        },
        autofocus: true,
        refocus: false,
      });
      insp.processSimpleDialogButtons(submitAndOpenDialog);
      style.set(submitAndOpenDialog.containerNode, { padding: '0px' });
      submitAndOpenDialog.show();
      var underlay = dom.byId('insp_DataDialog_underlay');
      style.set(underlay, { background: 'transparent' });
      insp.centerDialogOnParent(submitAndOpenDialog, inspectorDialog);
      onEvent(underlay, 'mousemove', function (e) {
        insp.removeHighlights();
        style.set(this, { display: 'none' });
        var node = document.elementFromPoint(e.clientX, e.clientY);
        style.set(this, { display: '' });
        if (node != insp.assertHighlight && node.tagName == 'BUTTON') {
          insp.highlightHover = node;
          insp.addHighlight(node, '2px solid blue');
        }
      });
      this.clickHandler = onEvent(underlay, 'mousedown', function (e) {
        style.set(this, { display: 'none' });
        var node = document.elementFromPoint(e.clientX, e.clientY);
        style.set(underlay, { display: '' });
        e.cancelBubble = true;
        e.preventDefault();
        if (node.tagName == 'BUTTON') {
          dom.byId('insp_dataId').value = node.id;
        }
      });
    },
    addSubmitAndOpen: function (node) {
      var insp = this;
      var id = dom.byId('insp_dataId').value;
      var commentValue = 'Click the Submit button in the dialog';
      var note = insp.updateParams('interaction added to position', [id]);
      insp.showNotification(note, 0);
      insp.centerDialogOnParent(submitAndOpenDialog, inspectorDialog);
      insp.addInteractionNoCheck(null, {
        event: 'clickSubmitAndOpenReport',
        id: id,
        comment: commentValue,
        eventType: 'click',
      });
      dom.byId('insp_dataId').value = '';
      var message = this.resources.strings.click_submit_success;
      insp.showNotification(
        message + ' ' + (parseInt(insp.currentInteraction) + 1),
        0
      );
    },
    assertSql: function () {
      var insp = this;
      sqlDialog = new insp.InspectorDialog({
        id: 'insp_assertSqlDialog',
        title: 'Assert SQL Statement',
        content:
          '' +
          '      	<div class="notification" id="assertSql_dialog" style="text-align: center; height:20px;">&nbsp;</div>' +
          '  		<div class = "insp_d_content" style="width:450px;height:180px">' +
          '				<label for="insp_dataId"><span style="color:orange">* </span>' +
          insp.resources.strings.field_id +
          '</label><br>' +
          '				<input type="text" id="insp_dataId" size="30" readonly style="background-color: #e7e7e7; border: 1px solid #999; margin-right: 10px"/><br><br>' +
          '				<label for="insp_assertSqlstmt"><span style="color:orange">*</span>' +
          insp.resources.strings.sql_stmt +
          '</label><br>' +
          ' 				<input type="text" id="insp_assertSqlstmt" name="insp_assertSqlstmt" style="width:400px"/><br><br>' +
          '				<label for="insp_assertSqlComment">' +
          insp.resources.strings.comment +
          '</label><br>' +
          '				<input type="text" id="insp_assertSqlComment" style="width: 400px" /><br><br>' +
          '				<button id="insp_assert_sql_true" data-method="assert_sql_true">' +
          insp.resources.strings.assert_sql_true +
          '</button>&nbsp;' +
          '				<button id="insp_assert_sql_false" data-method="assert_sql_false">' +
          insp.resources.strings.assert_sql_false +
          '</button>&nbsp;' +
          '		</div>' +
          '		<div class="inspectorToolbar" style="text-align:' +
          reverseAlign +
          '">' +
          '				<button id="insp_cancelDataButton" data-method="cancel">' +
          insp.resources.strings.done +
          '</button>&nbsp;' +
          '		</div>',

        onHide: function () {
          var dialog = registry.byId('insp_assertSqlDialog');
          var inspDialog = registry.byId('insp_inspectorDialog');
          style.set(inspDialog.domNode, {
            display: '',
            left: inspectorData.dialogPosition.x + 'px',
            top: inspectorData.dialogPosition.y + 'px',
          });
          insp.removeHighlights();
          dialog.destroyRecursive(false);
          Dialog._DialogLevelManager.hide(sqlDialog);
          inspectorData.recording = rec;
          this.clickHandler.remove();
        },
        onMouseUp: function () {
          inspectorData.dialogPosition = geom.position(this.domNode);
          insp.storeData();
        },
        wasRecording: inspectorData.recording,
        closable: true,
        autofocus: true,
        refocus: false,
      });
      insp.processSimpleDialogButtons(sqlDialog);
      style.set(sqlDialog.containerNode, { padding: '0px' });
      sqlDialog.show();
      var underlay = dom.byId('insp_assertSqlDialog_underlay');
      style.set(underlay, { background: 'transparent' });
      onEvent(underlay, 'mousemove', function (e) {
        insp.removeHighlights();
        style.set(this, { display: 'none' });
        var node = document.elementFromPoint(e.clientX, e.clientY);
        style.set(this, { display: '' });
        if (node.id) {
          array.some(insp.getUseAttributes(node).sort(), function (attribute) {
            if (insp.isAssertionNode(node, attr.get(node, attribute))) {
              insp.highlightHover = node;
              insp.addHighlight(node, '2px solid blue');
            }
          });
        }
      });
      this.clickHandler = onEvent(underlay, 'mousedown', function (e) {
        if (attr.get('insp_assertSqlDialog', 'display') != 'none') {
          style.set(this, { display: 'none' });
          var node = document.elementFromPoint(e.clientX, e.clientY);
          style.set(underlay, { display: '' });
          e.cancelBubble = true;
          e.preventDefault();
          if (node.tagName == 'INPUT') {
            dom.byId('insp_dataId').value = node.id;
            dom.byId('insp_assertSqlstmt').focus();
          }
        }
      });
      style.set(sqlDialog.domNode, {
        left: parseInt(inspectorDialog.domNode.style.left, 10) + 'px',
        top: parseInt(inspectorDialog.domNode.style.top, 10) + 'px',
        width: parseInt(inspectorDialog.domNode.clientWidth, 10) + 'px',
      });
      style.set(registry.byId('insp_inspectorDialog').domNode, {
        display: 'none',
      });
      insp.addClearFields(inspectorDialog.domNode);
    },
    assert_sql_true: function () {
      var insp = this;
      if (insp.validateSqlAssert()) {
        var id = dom.byId('insp_dataId').value;
        var sqlStmt = dom.byId('insp_assertSqlstmt').value;
        var note = dom.byId('insp_assertSqlComment').value;
        var message = this.resources.strings.assert_true;
        insp.addInteractionNoCheck(null, {
          event: 'assertAttributeTrue',
          id: id + '',
          attribute: 'value',
          value: 'sql: ' + sqlStmt,
          comment: note,
        });
        if (dom.byId('insp_assertSqlstmt'))
          dom.byId('insp_assertSqlstmt').value = '';
        if (dom.byId('insp_assertSqlComment'))
          dom.byId('insp_assertSqlComment').value = '';
        if (dom.byId('insp_dataId')) dom.byId('insp_dataId').value = '';
        insp.showNotification(message, 0);
      }
    },
    validateSqlAssert: function () {
      var id = dom.byId('insp_assertSqlstmt').value;
      var nameValid = false;
      var idValid = false;
      if (id.length > 0) {
        idValid = true;
      }
      var fieldId = dom.byId('insp_dataId').value;
      if (fieldId.length > 0) {
        nameValid = true;
      }
      return nameValid && idValid;
    },
    assert_sql_false: function () {
      var insp = this;
      if (insp.validateSqlAssert()) {
        var id = dom.byId('insp_dataId').value;
        var sqlStmt = dom.byId('insp_assertSqlstmt').value;
        var note = dom.byId('insp_assertSqlComment').value;
        insp.addInteractionNoCheck(null, {
          event: 'assertAttributeFalse',
          id: id + '',
          attribute: 'value',
          value: 'sql: ' + sqlStmt,
          comment: note,
        });
        var message = this.resources.strings.assert_false;
        if (dom.byId('insp_assertSqlstmt'))
          dom.byId('insp_assertSqlstmt').value = '';
        if (dom.byId('insp_assertSqlComment'))
          dom.byId('insp_assertSqlComment').value = '';
        insp.showNotification(message, 0);
      }
    },
    classifyAsset: function () {
      var insp = this;
      classifyDialog = new insp.InspectorDialog({
        id: 'insp_DataDialog',
        title: insp.resources.strings.classify_asset,
        content:
          '' +
          '<div class="notification" id="insp_classifyAsset" style="text-align: center;height: 20px;">&nbsp;</div>' +
          '<div id="insp_rootnode" style="padding:10px">' +
          '				<label for="insp_dataId">' +
          insp.resources.strings.field_id +
          '</label><br>' +
          '				<input type="text" id="insp_dataId" size="30" readonly style="background-color: #e7e7e7; border: 1px solid #999; margin-right: 10px"/>' +
          '</div>' +
          '<div class="insp_d_content">' +
          '	<label for="insp_classifyrootnode"><span style="color:orange">* Please note to input as {$CLASS1},{$CLASS2} when you have multiple variables</span><br>' +
          this.resources.strings.params_field +
          '</label><br>' +
          '		<input type="text" id="params_field" style="width: 300px"><br><br>' +
          '<label for="insp_classifyAssetComment">' +
          insp.resources.strings.comment +
          '</label><br>' +
          '<input type="text" id="insp_classifyAssetComment" style="width: 300px" />' +
          '</div>' +
          '<div class="inspectorToolbar" style="text-align:' +
          reverseAlign +
          '">' +
          '		<button id="insp_classify_asset" data-method="addclassifyAsset">' +
          insp.resources.strings.add +
          '</button>&nbsp;' +
          '		<button id="insp_done_classify" data-method="cancel">' +
          insp.resources.strings.done +
          '</button>&nbsp;' +
          '	</div>',
        onHide: function () {
          var dialog = registry.byId('insp_DataDialog');
          var inspDialog = registry.byId('insp_inspectorDialog');
          style.set(inspDialog.domNode, {
            display: '',
            left: inspectorData.dialogPosition.x + 'px',
            top: inspectorData.dialogPosition.y + 'px',
          });
          insp.removeHighlights();
          dialog.destroyRecursive(false);
          Dialog._DialogLevelManager.hide(classifyDialog);
          this.clickHandler.remove();
        },
        onShow: function () {
          Dialog._DialogLevelManager.show(classifyDialog);
        },
        autofocus: true,
        refocus: false,
      });
      insp.processSimpleDialogButtons(classifyDialog);
      style.set(classifyDialog.containerNode, { padding: '0px' });
      classifyDialog.show();
      var underlay = dom.byId('insp_DataDialog_underlay');
      style.set(underlay, { background: 'transparent' });
      insp.centerDialogOnParent(classifyDialog, inspectorDialog);
      onEvent(underlay, 'mousemove', function (e) {
        insp.removeHighlights();
        style.set(this, { display: 'none' });
        var node = document.elementFromPoint(e.clientX, e.clientY);
        style.set(this, { display: '' });
        if (
          node != insp.assertHighlight &&
          node.tagName == 'UL' &&
          node.id.indexOf('tree') > 0
        ) {
          insp.highlightHover = node;
          insp.addHighlight(node, '2px solid blue');
        }
      });
      this.clickHandler = onEvent(underlay, 'mousedown', function (e) {
        if (attr.get('insp_DataDialog', 'display') != 'none') {
          style.set(this, { display: 'none' });
          var node = document.elementFromPoint(e.clientX, e.clientY);
          style.set(underlay, { display: '' });
          e.cancelBubble = true;
          e.preventDefault();
          if (node.tagName == 'UL' && node.id.indexOf('tree') > 0) {
            dom.byId('insp_dataId').value = node.id;
          }
          insp.removeHighlights();
        }
      });
    },
    addclassifyAsset: function () {
      var insp = this;
      var id = dom.byId('insp_dataId').value;
      var params = dom.byId('params_field').value;
      var treeid = dom.byId('insp_dataId').value;
      var commentValue = '';
      var comment = dom.byId('insp_classifyAssetComment');
      if (comment) {
        commentValue = comment.value;
      }
      if (commentValue.trim().length === 0) {
        commentValue = 'Classify Item for node ' + id;
      }
      var note = insp.updateParams(this.resources.strings.add_classification, [
        id,
      ]);
      insp.showNotification(note, 0);
      insp.centerDialogOnParent(classifyDialog, inspectorDialog);
      if (insp.validateClassifyAsset()) {
        insp.addInteractionNoCheck(null, {
          event: 'findTreeItem',
          params: params,
          rootElementID: treeid,
          comment: commentValue,
        });
      }
      dom.byId('insp_dataId').value = '';
      dom.byId('insp_classifyAssetComment').value = '';
      dom.byId('params_field').value = '';
      classifyDialog.hide();
    },
    validateClassifyAsset: function () {
      var id = dom.byId('params_field').value;
      var treeid = dom.byId('insp_dataId').value;
      var nameValid = false;
      var idValid = false;
      if (id.length > 0 && treeid.includes('tree_tree')) {
        idValid = true;
      }
      var fieldId = dom.byId('insp_dataId').value;
      if (fieldId.length > 0) {
        nameValid = true;
      }
      return nameValid && idValid;
    },
    dates: function () {
      var insp = this;
      typeoverDatesDialog = new insp.InspectorDialog({
        id: 'insp_typeoverDateTimeDialog',
        title: 'Typeover for Date/Time Value',
        content:
          '' +
          '      	<div class="notification" id="insp_dates_info" style="text-align: center; height:20px;">&nbsp;</div>' +
          '  		<div class = "insp_d_content" style="width:600px;height:180px">' +
          '			<div id="insp_checkbox" style="padding:10px">' +
          '		<label for="insp_dataId"><span style="color:orange">* </span>' +
          insp.resources.strings.field_id +
          '</label><br>' +
          '		<input type="text" id="insp_dataId" size="30" readonly style="background-color: #e7e7e7; border: 1px solid #999; margin-right: 10px"/>' +
          '	</div>' +
          '		<table style="border-spacing: 10px;border-collapse: separate; width:520px;">' +
          '			<tr>' +
          '				<td>' +
          '					<label for="insp_typeoverDateType"><span style="color:orange">*</span>' +
          insp.resources.strings.dateType +
          '</label><br>' +
          '					<select id="insp_typeoverDateType" style="height:22px" >' +
          '					</select>' +
          '				</td>' +
          '				<td id="typeover_format">' +
          '					<label for="insp_typeoverDateFormat"><span style="color:orange">*</span>' +
          insp.resources.strings.date_format +
          '</label><br>' +
          '					<select id="insp_typeoverDateFormat" style="height:22px" >' +
          '					</select>' +
          '				</td>' +
          '			</tr>' +
          '		</table>' +
          '		<table id="typeover_date_options"; style="border-spacing: 5px;border-collapse: separate; width:520px; display:none;">' +
          '			<tr>' +
          '				<td id="typeover_days_option" width="40">' +
          '					<label for="insp_typeoverDateDays"><span style="color:orange">*</span>' +
          insp.resources.strings.date_days +
          '</label><br>' +
          '					<input type="number" min="0" max="50" value="0" style="height:22px; width:40px" id="insp_dateDays" style="border: 1px solid #999; margin-right: 10px"/>' +
          '				</td>' +
          '				<td id="typeover_years_option" width="40">' +
          '					<label for="insp_typeoverDateYears"><span style="color:orange">*</span>' +
          insp.resources.strings.date_years +
          '</label><br>' +
          '					<input type="number" min="0" max="50" value="0" style="height:22px; width:40px" id="insp_dateYears" style="border: 1px solid #999; margin-right: 10px"/>' +
          '				</td>' +
          '				<td id="typeover_months_option" width="40">' +
          '					<label for="insp_typeoverDateMonths"><span style="color:orange">*</span>' +
          insp.resources.strings.date_months +
          '</label><br>' +
          '					<input type="number" min="0" max="50" value="0" style="height:22px; width:40px" id="insp_dateMonths" style="border: 1px solid #999; margin-right: 10px"/>' +
          '				</td>' +
          '				<td id="typeover_hours_option" width="40">' +
          '					<label for="insp_typeoverDateHours"><span style="color:orange">*</span>' +
          insp.resources.strings.date_hours +
          '</label><br>' +
          '					<input type="number" min="0" max="50" value="0" style="height:22px; width:40px" id="insp_dateHours" style="border: 1px solid #999; margin-right: 10px"/>' +
          '				</td>' +
          '				<td id="typeover_minutes_option" width="40">' +
          '					<label for="insp_typeoverDateMinutes"><span style="color:orange">*</span>' +
          insp.resources.strings.date_minutes +
          '</label><br>' +
          '					<input type="number" min="0" max="50" value="0" style="height:22px; width:40px" id="insp_dateMinutes" style="border: 1px solid #999; margin-right: 10px"/>' +
          '				</td>' +
          '				<td id="typeover_originalDate_option" width="40">' +
          '					<label for="insp_originalDate"><span style="color:orange">*</span>' +
          insp.resources.strings.original_date +
          '</label><br>' +
          '					<input style="height:22px" id="insp_originalDate" style="border: 1px solid #999; margin-right: 10px"/>' +
          '				</td>' +
          '				<td>' +
          '					<br><button id="insp_typeoverDateButton" data-method="typeoverDate" style="vertical-align:middle; margin: 0px 5px; padding: 3px;" height: 22px; width: 22px ><img style="margin: 0px" width="18" height="18" title="" alt="" src="' +
          insp.resources.images.add +
          '" /></button>' +
          '				</td>' +
          '			</tr>' +
          '		</table>' +
          '		</div>' +
          '		<div class="inspectorToolbar" style="text-align:' +
          reverseAlign +
          '">' +
          '				<button id="insp_cancelDataButton" data-method="cancel">' +
          insp.resources.strings.done +
          '</button>&nbsp;' +
          '		</div>',

        onHide: function () {
          var dialog = registry.byId('insp_typeoverDateTimeDialog');
          var inspDialog = registry.byId('insp_inspectorDialog');
          style.set(inspDialog.domNode, {
            display: '',
            left: inspectorData.dialogPosition.x + 'px',
            top: inspectorData.dialogPosition.y + 'px',
          });
          insp.removeHighlights();
          dialog.destroyRecursive(false);
          Dialog._DialogLevelManager.hide(typeoverDatesDialog);
          inspectorData.recording = rec;
          this.clickHandler.remove();
        },
        onMouseUp: function () {
          inspectorData.dialogPosition = geom.position(this.domNode);
          insp.storeData();
        },
        wasRecording: inspectorData.recording,
        closable: true,
        autofocus: true,
        refocus: false,
      });
      insp.processSimpleDialogButtons(typeoverDatesDialog);
      style.set(typeoverDatesDialog.containerNode, { padding: '0px' });
      typeoverDatesDialog.show();
      var underlay = dom.byId('insp_typeoverDateTimeDialog_underlay');
      style.set(underlay, { background: 'transparent' });
      onEvent(underlay, 'mousemove', function (e) {
        insp.removeHighlights();
        style.set(this, { display: 'none' });
        var node = document.elementFromPoint(e.clientX, e.clientY);
        style.set(this, { display: '' });
        if (node.id) {
          array.some(insp.getUseAttributes(node).sort(), function (attribute) {
            if (insp.isAssertionNode(node, attr.get(node, attribute))) {
              insp.highlightHover = node;
              insp.addHighlight(node, '2px solid blue');
            }
          });
        }
      });
      this.clickHandler = onEvent(underlay, 'mousedown', function (e) {
        if (attr.get('insp_typeoverDateTimeDialog', 'display') != 'none') {
          style.set(this, { display: 'none' });
          var node = document.elementFromPoint(e.clientX, e.clientY);
          style.set(underlay, { display: '' });
          e.cancelBubble = true;
          e.preventDefault();
          if (node.tagName == 'INPUT') {
            dom.byId('insp_dataId').value = node.id;
            dom.byId('insp_typeoverDateType').focus();
          }
        }
      });
      style.set(typeoverDatesDialog.domNode, {
        left: parseInt(inspectorDialog.domNode.style.left, 10) + 'px',
        top: parseInt(inspectorDialog.domNode.style.top, 10) + 'px',
        width: parseInt(inspectorDialog.domNode.clientWidth, 10) + 'px',
      });
      style.set(registry.byId('insp_inspectorDialog').domNode, {
        display: 'none',
      });
      insp.addClearFields(inspectorDialog.domNode);

      var dateTypeSelect = dom.byId('insp_typeoverDateType');
      array.forEach(Object.keys(insp.dateTypes), function (key) {
        var option = document.createElement('option');
        option.innerHTML = key;
        dateTypeSelect.appendChild(option);
      });
      var dateFormatSelect = dom.byId('insp_typeoverDateFormat');
      array.forEach(Object.keys(insp.dateFormats), function (key) {
        var option = document.createElement('option');
        option.innerHTML = key;
        dateFormatSelect.appendChild(option);
      });
      onEvent(dateTypeSelect, 'change', function (e) {
        var dateType = dom.byId('insp_typeoverDateType');
        var current_Type = dateType.options[dateType.selectedIndex].value;
        var dateOptionsTable = dom.byId('typeover_date_options');

        if (current_Type == '') {
          dateOptionsTable.style.display = 'none';
        }
        if (current_Type == 'today' || current_Type == 'currentTime') {
          dateOptionsTable.style.display = 'table';
          dom.byId('typeover_days_option').style.display = 'none';
          dom.byId('typeover_years_option').style.display = 'none';
          dom.byId('typeover_months_option').style.display = 'none';
          dom.byId('typeover_hours_option').style.display = 'none';
          dom.byId('typeover_minutes_option').style.display = 'none';
          dom.byId('typeover_originalDate_option').style.display = 'none';
          dom.byId('typeover_format').style.display = '';
        }
        if (
          current_Type == 'daysFromToday' ||
          current_Type == 'daysBeforeToday'
        ) {
          dateOptionsTable.style.display = 'table';
          dom.byId('typeover_days_option').style.display = '';
          dom.byId('typeover_years_option').style.display = 'none';
          dom.byId('typeover_months_option').style.display = 'none';
          dom.byId('typeover_hours_option').style.display = 'none';
          dom.byId('typeover_minutes_option').style.display = 'none';
          dom.byId('typeover_originalDate_option').style.display = 'none';
          dom.byId('typeover_format').style.display = '';
        }
        if (
          current_Type == 'timeFromToday' ||
          current_Type == 'timeBeforeToday'
        ) {
          dateOptionsTable.style.display = 'table';
          dom.byId('typeover_days_option').style.display = '';
          dom.byId('typeover_years_option').style.display = '';
          dom.byId('typeover_months_option').style.display = '';
          dom.byId('typeover_hours_option').style.display = '';
          dom.byId('typeover_minutes_option').style.display = '';
          dom.byId('typeover_originalDate_option').style.display = 'none';
          dom.byId('typeover_format').style.display = '';
        }
        if (
          current_Type == 'dateTimeFromToday' ||
          current_Type == 'dateTimeFromDate'
        ) {
          dateOptionsTable.style.display = 'table';
          dom.byId('typeover_days_option').style.display = 'none';
          dom.byId('typeover_years_option').style.display = 'none';
          dom.byId('typeover_months_option').style.display = 'none';
          dom.byId('typeover_hours_option').style.display = '';
          dom.byId('typeover_minutes_option').style.display = '';
          dom.byId('typeover_originalDate_option').style.display = 'none';
          dom.byId('typeover_format').style.display = '';
        }
        if (
          current_Type == 'dateTimeFromDate' ||
          current_Type == 'dateTimeBeforeDate'
        ) {
          dateOptionsTable.style.display = 'table';
          dom.byId('typeover_days_option').style.display = 'none';
          dom.byId('typeover_years_option').style.display = 'none';
          dom.byId('typeover_months_option').style.display = 'none';
          dom.byId('typeover_hours_option').style.display = '';
          dom.byId('typeover_minutes_option').style.display = '';
          dom.byId('typeover_originalDate_option').style.display = '';
          dom.byId('typeover_format').style.display = 'none';
        }
        if (current_Type == 'currentDayOfWeek') {
          dateOptionsTable.style.display = 'table';
          dom.byId('typeover_days_option').style.display = 'none';
          dom.byId('typeover_years_option').style.display = 'none';
          dom.byId('typeover_months_option').style.display = 'none';
          dom.byId('typeover_hours_option').style.display = 'none';
          dom.byId('typeover_minutes_option').style.display = 'none';
          dom.byId('typeover_originalDate_option').style.display = 'none';
          dom.byId('typeover_format').style.display = 'none';
        }
        if (current_Type == 'dayOfWeekFromDate') {
          dateOptionsTable.style.display = 'table';
          dom.byId('typeover_days_option').style.display = 'none';
          dom.byId('typeover_years_option').style.display = 'none';
          dom.byId('typeover_months_option').style.display = 'none';
          dom.byId('typeover_hours_option').style.display = 'none';
          dom.byId('typeover_minutes_option').style.display = 'none';
          dom.byId('typeover_originalDate_option').style.display = '';
          dom.byId('typeover_format').style.display = 'none';
        }
      });
    },

    typeoverDate: function () {
      var insp = this;
      var iframedoc = document;
      if (insp.validateTypeoverDate()) {
        var id = dom.byId('insp_dataId').value;
        var type = dom.byId('insp_typeoverDateType').value;
        var format = dom.byId('insp_typeoverDateFormat').value;
        var note = this.resources.strings.dates_message;
        if (id.indexOf('tfrow') == -1) {
          var newString = id.split("-");
          var parentID = newString[0]+"-lb";
          var parentNode = dom.byId(parentID);
          var labelName = parentNode.innerText.replace(/:/g, "");
          if (newString[1] == "tb2")
              labelName = labelName + " Description";
        } else {
          var parentID = id.replace('txt-tb', 'ttitle-lb');
          var parentID = parentID.replace('tfrow', 'ttrow');
          var parentNode = dom.byId(parentID);
          var labelName = parentNode.innerText;
        }
        var comment = "Type '" + type + "' in the " + labelName + ' field';
        var blank = false;
        if (
          format == '' &&
          type != 'dateTimeFromDate' &&
          type != 'dateTimeBeforeDate'
        ) {
          var blank = true;
        }
        var varname = 'date';
        if (
          (type == 'today' && blank !== true) ||
          (type == 'currentTime' && blank !== true)
        ) {
          insp.addInteractionNoCheck(null, {
            event: 'typeover',
            id: id,
            params: varname,
            date: [{ date: type, format: format }],
            comment: comment,
          });
          insp.showNotification(note, 0);
        } else if (
          (type == 'daysFromToday' && blank !== true) ||
          (type == 'daysBeforeToday' && blank !== true)
        ) {
          var days = dom.byId('insp_dateDays').value;
          insp.addInteractionNoCheck(null, {
            event: 'typeover',
            id: id,
            params: varname,
            date: [{ date: type, format: format, days: days }],
            comment: comment,
          });
          insp.showNotification(note, 0);
        } else if (
          (type == 'timeFromToday' && blank !== true) ||
          (type == 'timeBeforeToday' && blank !== true)
        ) {
          var days = dom.byId('insp_dateDays').value;
          var months = dom.byId('insp_dateMonths').value;
          var years = dom.byId('insp_dateYears').value;
          var hours = dom.byId('insp_dateHours').value;
          var minutes = dom.byId('insp_dateMinutes').value;
          insp.addInteractionNoCheck(null, {
            event: 'typeover',
            id: id,
            params: varname,
            date: [
              {
                date: type,
                format: format,
                days: days,
                months: months,
                years: years,
                hours: hours,
                minutes: minutes,
              },
            ],
            comment: comment,
          });
          insp.showNotification(note, 0);
        } else if (
          (type == 'dateTimeFromDate' && blank !== true) ||
          (type == 'dateTimeBeforeDate' && blank !== true)
        ) {
          var hours = dom.byId('insp_dateHours').value;
          var minutes = dom.byId('insp_dateMinutes').value;
          var originalDate = dom.byId('insp_originalDate').value;
          insp.addInteractionNoCheck(null, {
            event: 'typeover',
            id: id,
            params: varname,
            date: [
              {
                date: type,
                initialDate: originalDate,
                hours: hours,
                minutes: minutes,
              },
            ],
            comment: comment,
          });
          insp.showNotification(note, 0);
        } else if (type == 'currentDayOfWeek') {
          insp.addInteractionNoCheck(null, {
            event: 'typeover',
            id: id,
            params: varname,
            date: [{ date: type }],
            comment: comment,
          });
          insp.showNotification(note, 0);
        } else if (type == 'dayOfWeekFromDate') {
          var originalDate = dom.byId('insp_originalDate').value;
          insp.addInteractionNoCheck(null, {
            event: 'typeover',
            id: id,
            params: varname,
            date: [{ date: type, inputDate: originalDate }],
            comment: comment,
          });
          insp.showNotification(note, 0);
        }

        dom.byId('insp_dataId').value = '';
        if (dom.byId('insp_originalDate').value != '')
          dom.byId('insp_originalDate').value = '';
      }
    },
    validateTypeoverDate: function () {
      var varField = dom.byId('insp_dataId');
      var variable = varField.value;
      if (
        this.varNames.indexOf(variable) === -1 &&
        variable.length >= this.minVariableNameLength
      ) {
        if (isNaN(parseInt(variable.substring(0, 1)))) {
          //makes sure we do not start with a number
          setButtonEnabled(dom.byId('insp_typeoverDateButton'), true);
          style.set(varField, 'color', 'black');
          return true;
        }
      }
      style.set(varField, 'color', 'red');
      setButtonEnabled(dom.byId('insp_typeoverDateButton'), false);
      return false;
    },
  });
});
