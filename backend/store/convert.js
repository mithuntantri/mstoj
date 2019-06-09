var xlsx = require('node-xlsx');
var fs = require('fs');
var csv=require('csvtojson');
var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");
let mysqlOps = require("../store/mysqlOps")

var convertToCSV = (option, filename)=>{
    return new Promise((resolve, reject)=>{
        var obj = xlsx.parse(filename);
        var rows = [];
        var writeStr = "";

        for(var i = 0; i < obj.length; i++){
            var sheet = obj[i];
            for(var j = 0; j < sheet['data'].length; j++){
                    rows.push(sheet['data'][j]);
            }
        }

        for(var i = 0; i < rows.length; i++){
            writeStr += rows[i].join(",") + "\n";
        }

        fs.writeFile(filename.split(".")[0] + ".csv", writeStr, function(err) {
            if(err) {
                reject(err)
            }
            importCSV(option, filename.split(".")[0] + ".csv").then(()=>{
                resolve()                
            }).catch((err)=>{
                reject(err)
            })
        });
    })
}

var importCSV = (option, filename)=>{
    return new Promise((resolve, reject)=>{
        let lines = []
        fs.readFile(filename, 'utf8', function(err, contents) {
            lines = contents.split("\n")
            console.log(lines[0]);
            console.log(lines[1]);
        });
        csv()
        .fromFile(filename)
        .then((jsonObj)=>{
            if(option == 'Upload_Product_List'){
                importProductList(jsonObj).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            }else if(option == 'Upload_Daily_Data'){
                importDailyData(lines).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            }else if(option == 'Upload_IWS_List'){
                importIWSList(jsonObj).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            }else if(option == 'Upload_Target_List'){
                importTargetList(lines).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            }
        })
    })
}

var importProductList = (obj)=>{
    return new Promise((resolve, reject)=>{
        let query = `DELETE FROM products`
        sqlQuery.executeQuery([query]).then(()=>{
            console.log(Object.keys(obj[0]).length)
            let required_column_length = 5
            if(Object.keys(obj[0]).length == required_column_length){
                console.log("product list", obj)
                let queries = []
                let products = _.pluck(obj ,'TOJ Products')
                let categories = _.pluck(obj , 'Product Category')
                let level = _.pluck(obj, 'Product Level')
                let discount = _.pluck(obj, 'Discount')
                let base_price = _.pluck(obj, 'Base Price')
                console.log(products)
                _.each(products, (product, i)=>{
                    product = product.replace("-", " ")
                    product = product.replace("  ", " ")
                    product = product.replace("  ", " ")
                    product = toTitleCase(product)
                    queries.push(`INSERT INTO products (id, product_category, product_name, product_level, discount, base_price) VALUES(${i+1}, '${product}', '${categories[i]}', '${level[i][0].toUpperCase()}', ${parseFloat(discount[i])}, ${parseFloat(base_price[i])})`)
                })
                console.log(queries)
                console.log("Inserting Products -> ", queries.length)
                sqlQuery.executeQuery(queries).then((result)=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
                resolve()
            }else{
                reject(`Invalid File Format for Product List`)
            }
        }).catch((err)=>{
                reject(`Invalid File Format for Product List`)
        })
    })
}

var redoImportDailyData = (lines, count, total_products)=>{
    return new Promise((resolve, reject)=>{
        console.log("count", count + "/" + lines.length)
        if(count < lines.length){
            let headers = lines[0].split(",")
            let columns = lines[count].split(",")
            let queries = []
            let target = {
                'ddt_code': columns[0],
                'ddt_name': columns[1],
                'iws_code': columns[2],
                'loc_code': columns[3],
                'iws_category': columns[4],
                'upload_date': moment().format("MMM YYYY")
            }
            for(let i=5;i<columns.length;i=i+2){
                if(i%2 != 0){
                    let product_id = getProductID(headers[i])
                    console.log("product_id", product_id)
                    let product = {
                        'product_id': product_id,
                        'target_quantity': parseFloat(columns[i]),
                        'target_value': parseFloat(columns[i+1].replace(",", ""))
                    }
                    if(product.ticket_number != "-" && !isNaN(product.target_quantity) && !isNaN(product.target_value) && product.target_quantity != 'NaN'){
                        let query = `INSERT IGNORE INTO uploads (ddt_code, ddt_name, iws_code, loc_code, iws_category, upload_date, product_id, target_quantity, target_value) VALUES('${target.ddt_code}', '${target.ddt_name}', '${target.iws_code}', '${target.loc_code}', '${target.iws_category}', '${target.upload_date}', ${product.product_id}, ${product.target_quantity}, '${product.target_value}')`
                        console.log(query)
                        queries.push(query)                        
                    }
                }
                console.log("queries", queries.length, columns.length)
                if(queries.length == 17){
                    sqlQuery.executeQuery(queries).then(()=>{
                        count++
                        redoImportDailyData(lines, count, total_products).then(()=>{
                            resolve()
                        }).catch((err)=>{
                            reject()
                        })
                    }).catch((err)=>{
                        console.log("SQL Error", err)
                        reject(err)
                    })
                }
            }
        }else{
            resolve()
        }
    })
}

var importDailyData = (lines)=>{
    return new Promise((resolve, reject)=>{
        let query = `SELECT * FROM products where product_level='D' OR product_level='A'`
        sqlQuery.executeQuery([query]).then((result)=>{
            let total_products = result[0].length
            console.log("total_products", total_products)
            products_list = result[0]
            console.log("products_list", products_list)
            let required_column_length = 120
            let columns = lines[0].split(",")
            console.log("columns", columns.length, "/", required_column_length)
            if(total_products == 0){
                reject(`Upload Daily Data before uploading target list`)
            }else if(columns.length == required_column_length){
                redoImportDailyData(lines, 1, total_products).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            }else{
                reject(`Invalid File Format for Daily Data`)
            }
        })
    })
}

var importIWSList = (obj)=>{
    return new Promise((resolve, reject)=>{
        let required_column_length = 4
        console.log(Object.keys(obj[0]).length)
        if(Object.keys(obj[0]).length == required_column_length){
            let queries = []
            let distributors = removeDuplicates(obj, "DDT Code")
            _.each(distributors, (d)=>{
                d.name = d['DDT Name']
                d.ddt_code = d['DDT Code']
            })
            console.log(distributors)
            mysqlOps.insertAdminValues(distributors).then(()=>{
                console.log("Inserting New Admins -> Done")

                _.each(obj, (o)=>{
                    console.log(o)
                    o.ddt_code = o['DDT Code']
                    o.iws_code = o['IW Code']
                    o.name = o['IWS Name']
                    queries.push(`INSERT IGNORE INTO iws (iws_code, name, ddt_code) VALUES ('${o.iws_code}', '${o.name}', '${o.ddt_code}')`)
                })

                console.log("Inserting IWS -> ", queries.length)
                sqlQuery.executeQuery(queries).then((result)=>{
                    console.log("done")
                    resolve()
                }).catch((err)=>{
                    console.log(err)
                    reject(err)
                })
            }).catch((err)=>{
                console.log(err)
                reject(err)
            })
        }else{
            reject(`Invalid File Format for IWS List`)
        }
    })
}

function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

function removeDuplicates(originalArray, prop) {
     var newArray = [];
     var lookupObject  = {};

     for(var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
     }

     for(i in lookupObject) {
         newArray.push(lookupObject[i]);
     }
      return newArray;
}

var redoImportTargetList = (lines, count, total_products)=>{
    return new Promise((resolve, reject)=>{
        console.log("count", count + "/" + lines.length)
        if(count < lines.length){
            let headers = lines[0].split(",")
            let columns = lines[count].split(",")
            let queries = []
            let target = {
                'ddt_code': columns[0],
                'ddt_name': columns[1],
                'iws_code': columns[2],
                'loc_code': columns[3],
                'iws_ticket': columns[4],
                'target_date': moment().format("MMM YYYY")
            }
            for(let i=5;i<columns.length-1;i=i+2){
                if(i%2 != 0){
                    let product_id = getProductID(headers[i])
                    console.log("product_id", product_id, headers[i])
                    let product = {
                        'product_id': product_id,
                        'target_quantity': columns[i],
                        'ticket_number': columns[i+1]
                    }
                    // if(product.ticket_number != "-"){
                        let query = `INSERT IGNORE INTO targets (ddt_code, ddt_name, iws_code, loc_code, iws_ticket, target_date, product_id, target_quantity, ticket_number) VALUES('${target.ddt_code}', '${target.ddt_name}', '${target.iws_code}', '${target.loc_code}', '${target.iws_ticket}', '${target.target_date}', ${product.product_id}, ${product.target_quantity}, '${product.ticket_number}')`
                        // console.log(query)
                        queries.push(query)                        
                    // }
                }
                console.log("queries", queries.length, columns[columns.length-1])
                if(queries.length == parseInt(columns[columns.length-1])){
                    sqlQuery.executeQuery(queries).then(()=>{
                        count++
                        redoImportTargetList(lines, count).then(()=>{
                            resolve()
                        }).catch((err)=>{
                            reject()
                        })
                    }).catch((err)=>{
                        console.log("SQL Error", err)
                        reject(err)
                    })
                }
            }
        }else{
            resolve()
        }
    })
}

var products_list = []

function getProductID(product_name){
    let product_id = 17
    _.each(products_list, (product)=>{
        product_name = product_name.replace("-", " ")
        product_name = product_name.replace("  ", " ")
        product_name = product_name.replace("  ", " ")
        product_name = toTitleCase(product_name)
        console.log("product_name>>", product_name, product.product_category)
        if(product.product_category == product_name){
            // console.log("return<<<<", product.id)
            product_id = product.id
        }
    })
    // console.log("return<<<<", product_id)
    return product_id
}


var importTargetList = (lines)=>{
    return new Promise((resolve, reject)=>{
        let query = `SELECT * FROM products where product_level='I' OR product_level='A'`
        sqlQuery.executeQuery([query]).then((result)=>{
            let total_products = result[0].length
            console.log("total_products", total_products)
            products_list = result[0]
            console.log("products_list", products_list)
            let required_column_length = 6 + (total_products * 2)
            let columns = lines[0].split(",")
            console.log("columns", columns.length)
            if(total_products == 0){
                reject(`Upload Product List before uploading target list`)
            }else if(columns.length == required_column_length){
                redoImportTargetList(lines, 1, total_products).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            }else{
                reject(`Invalid File Format for Target/Ticket List`)
            }
        })
    })
}

module.exports = {
    convertToCSV: convertToCSV
}