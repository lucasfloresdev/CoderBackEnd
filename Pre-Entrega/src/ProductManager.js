const { log } = require('console');
const fs = require('fs');
const { v4 : uuidV4 } = require('uuid');

class ProductManager {
    constructor( path ){
        this.path = path;
    }

    async getProducts() {
        const products = await getProductsFromFile(this.path);
        return products;
    }

    async addProduct( product ) {
        //Validate
        if ( !product.code || !product.title || !product.description || !product.price || !product.thumbnail || !product.stock ){
            throw new Error('All the fields are required');
        }
        //Read File
        const products = await getProductsFromFile(this.path);
        //Validate code
        let duplicatedProduct = products.find( prod => prod.code === product.code );
        if ( duplicatedProduct ){
            throw new Error('Product code already exist');
        }
        //Add Product
        const newProduct = {
            id: uuidV4(),
            ...product
        }
        products.push( newProduct );
        //Write File
        await saveProductsInFile( this.path, products );

        return newProduct;
    }

    async getProductById( id ){
        //Read File
        const products = await getProductsFromFile(this.path);
        //Validate
        let product = products.find( product => product.id === id );
        if(!product){
            throw new Error('Product does not exist');
        }
        if(product.code === 'deleted'){
            throw new Error('This item was deleted');
        }
        return product;
    }

    async updateProduct( id, data ){
        const { code, title, description, price, thumbnail, stock } = data;
        //Read File
        const products = await getProductsFromFile(this.path);
        //Validate
        const index = products.findIndex( (product) => product.id === id );
        if ( index === -1 ){
            throw new Error('Product not found or missing id');
        }
        const duplicadtedCode = products.find( (product) => ( product.code === code ) );
        if ( duplicadtedCode ){
            throw new Error('Code already exists');
        }
        if( products[index].code === 'deleted' ){
            throw new Error('This item was deleted');
        }
        //Update Product
        if (code){
            products[index].code = code;
        }
        if (title){
            products[index].title = title;
        }
        if (description){
            products[index].description = description;
        }
        if (price){
            products[index].price = price;
        }
        if (thumbnail){
            products[index].thumbnail = thumbnail;
        }
        if (stock){
            products[index].stock = stock;
        }
        //Write File
        await saveProductsInFile( this.path, products );

        return products[index];
    }

    async deleteProduct( id ){
        //Read File
        const products = await getProductsFromFile(this.path);
        //Validate
        const index = products.findIndex( (product) => product.id === id );
        if ( index === -1 ){
            throw new Error('Product not found');
        }
        //Delete Product
        const tempId = products[index].id;
        products[index]={};
        products[index]={
            id : tempId,
            code : 'deleted',
        }
        //Write File
        await saveProductsInFile( this.path, products );

        return 'product deleted';
    }
}

const getProductsFromFile = async (path) => {
    if (!fs.existsSync(path)){
        return [];
    }
    const content = await fs.promises.readFile( path, 'utf-8' ); 
    return JSON.parse(content);
}

const saveProductsInFile = async (path, data) => {
    const content = JSON.stringify( data, null, '\t' );
    return fs.promises.writeFile( path, content, 'utf-8' );
}

module.exports = ProductManager;