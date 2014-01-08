'use strict';

var fs = require('fs');
var src = './pre-commit.sh';
var out = './.git/hooks/pre-commit';

fs.exists('./.git', function(yes){
  if(yes){
    fs.createReadStream(src)
      .pipe(fs.createWriteStream(out)
        .on('close', function(){
          fs.chmod(out, '755');
        })
      );
  }
});