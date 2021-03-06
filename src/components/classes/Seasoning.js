/** Class representing a seasoning object */
class Seasoning {
    /**
     * Internal class used for information hiding principle, which stores information about a specific
     * seasoning, including its own image url.
     * @constructor
     * @param {Object} seasoning
     * @param {string} seasoning.name
     * @param {string|null} [seasoning.spoonacularName=null] - Used as a more Spoonacular's API friendly name, found by querying Spoonacular about its preferred name
     * @param {string|null} [seasoning.imageURL=null] - Link to image
     * @param {string} [seasoning.userID=null] - User ID from Firebase
     * @param {string} [seasoning.firestoreID=null] - ID in Firestore
     */
    constructor({ name, spoonacularName, imageURL, userID, firestoreID }) {
        this.name = name;
        this.spoonacularName = spoonacularName ? spoonacularName : null;
        this.imageURL = imageURL ? imageURL : null;
        this.userID = userID ? userID : null;
        this.firestoreID = firestoreID ? firestoreID : null;
    }

    /**
     * @typedef {Object} firestoreSeasoning
     * @property {string} firestoreSeasoning.name
     * @property {string|null} [firestoreSeasoning.spoonacularName=null] - Used as a more Spoonacular's API friendly name, found by querying Spoonacular about its preferred name
     * @property {string|null} [firestoreSeasoning.imageURL=null] - Link to image
     * @property {string} [firestoreSeasoning.userID=null] - User ID from Firebase
     * 
     * Returns the firestore data for the ingredient
     * @returns {firestoreSeasoning}
     */
    getFirestoreData() {
        return {
            name: this.name,
            spoonacularName: this.spoonacularName,
            imageURL: this.imageURL,
            userID: this.userID,
        }
    }

    /**
     * Returns the type of ingredient that it is.
     * @returns {string} seasoning
     */
    getClassType() {
        return "Seasoning";
    }
}

export default Seasoning;
