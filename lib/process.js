class LambdaFunction {
}
export var HttpMethod;
(function (HttpMethod) {
    HttpMethod["GET"] = "GET";
    HttpMethod["POST"] = "POST";
    HttpMethod["PUT"] = "PUT";
    HttpMethod["DELETE"] = "DELETE";
})(HttpMethod || (HttpMethod = {}));
export var AuthorizerType;
(function (AuthorizerType) {
    AuthorizerType["REQUEST"] = "request";
})(AuthorizerType || (AuthorizerType = {}));
export class Authorizer {
    constructor(params) {
        this.print = () => {
            return `
          authorizer:
            name: ${this.name}
            resultTtlInSeconds: ${this.resultTtlInSeconds}
            identitySource: ${this.identitySource}
            type: ${this.type}
        `;
        };
        this.name = params.name;
        this.resultTtlInSeconds = params.resultTtlInSeconds;
        this.identitySource = params.identitySource;
        this.type = params.type;
    }
}
export class HttpFunction extends LambdaFunction {
    constructor(params) {
        super();
        this.print = (file, name) => {
            return `
  ${name}:
    handler: ${file}
      events:
        - httpApi: 
          method: ${this.method}
          path: ${this.path}`.concat(this.authorizer ? this.authorizer.print() : '');
        };
        this.path = params.path;
        this.method = params.method;
        this.authorizer = params.authorizer;
    }
}
const fs = require('fs');
const readline = require('readline');
const dir = 'src';
const processLine = (filename, line, d, w) => {
    console.log(filename);
    console.log(line);
    console.log(d);
    console.log(w);
    const tline = line.trim();
    if (tline.startsWith('//§DSL')) {
        console.log(eval(tline.substring(7)).print(filename, 'nameHere'));
    }
};
const processFile = (filePath) => {
    readline
        .createInterface({
        input: fs.createReadStream(filePath),
    })
        .on('line', processLine.bind(filePath, this));
};
const processDir = (err, filenames) => {
    if (err) {
        console.log("Error reading folder 'src', make sure it exists");
    }
    console.log(`Processing ${dir}`);
    filenames.forEach((filename) => {
        console.log(`\tProcessing ${filename}`);
        processFile(`${dir}/${filename}`);
    });
};
console.log('******************************');
console.log('   SERVERLESS DSL Generator');
console.log('******************************');
fs.readdir(dir, processDir);
//# sourceMappingURL=process.js.map