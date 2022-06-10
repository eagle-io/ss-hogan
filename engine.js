// Hogan Template Engine wrapper for SocketStream 0.3

var fs = require('fs'),
    path  = require('path'),
    hogan = require('hogan.js');

// export hogan engine
exports.core = hogan;

exports.init = function(ss, config) {

  // Send Hogan VM to the client
  var clientCode = fs.readFileSync(path.join(__dirname, 'client.js'), 'utf8');
  ss.client.send('lib', 'hogan-template', clientCode);

  return {

    name: 'Hogan',

    // Added: pass bool to prefix/suffix to determine if the template should be wrapped in script tags (use noWrap=true when including templates in external js)

    // Opening code to use when a Hogan template is called for the first time
    prefix: function(isExternalJs) {
      if (isExternalJs === true) {
        return '(function(){var ht=Hogan.Template,t=require(\'socketstreamx\').tmpl;'
      }
      return '<script type="text/javascript">(function(){var ht=Hogan.Template,t=require(\'socketstreamx\').tmpl;'
    },

    // Closing code once all Hogan templates have been written into the <script> tag
    suffix: function(isExternalJs) {
      if (isExternalJs === true) {
        return '}).call(this);';
      }
      return '}).call(this);</script>';
    },

    // Compile template into a function and attach it to ss.tmpl
    process: function(template, path, id) {

      var compiledTemplate;

      try {
        compiledTemplate = hogan.compile(template, {asString: true});
      } catch (e) {
        var message = '! Error compiling the ' + path + ' template into Hogan';
        console.log(String.prototype.hasOwnProperty('red') && message.red || message);
        throw new Error(e);
        compiledTemplate = '<p>Error</p>';
      }

      return 't[\'' + id + '\']=new ht(' + compiledTemplate + ');';    
    }
  }
}