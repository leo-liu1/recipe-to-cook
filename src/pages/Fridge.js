import React, { useState, useEffect, useContext } from 'react';
import ClassNames from 'classnames';

import { FirestoreContext } from '../components/handlers/FirestoreHandler';
import { SpoonacularContext } from '../components/handlers/SpoonacularHandler';
import DatePicker from "react-datepicker";
import Ingredient from '../components/classes/Ingredient';
import Seasoning from '../components/classes/Seasoning';

import meatImage from '../assets/images/meat.jpg';
import dairyImage from '../assets/images/dairy.jpg';
import carbImage from '../assets/images/carb.jpg';
import fruitImage from '../assets/images/fruit.jpg';
import vegetableImage from '../assets/images/vegetable.jpg';
import seasoningImage from '../assets/images/seasoning.jpg';

import "react-datepicker/dist/react-datepicker.css";

const ITEM_ROW_LENGTH = 4;

export default function Fridge({ populateSearch }) {
    document.title = 'Fridge';
    const ingredientTypes = [
        'Meat',
        'Dairy',
        'Vegetable',
        'Fruit',
        'Carbs',
    ];
    
    const [fridge, setFridge] = useState(null); // state to keep track of all fridge ingredients, on first render we don't render anything
    const [showForm, setShowForm] = useState(false);
    const [originalTitle, setOriginalTitle] = useState(''); // used for editing ingredients, display original ingredient name
    const [newIngredient, setNewIngredient] = useState(false);
    const [isSeasoning, setIsSeasoning] = useState(false);
    const [formData, setFormData] = useState({ // data associated with the input form
        formIngredientName: '',
        formIngredientType: ingredientTypes[0],
        formIngredientExp: new Date(),
        formIngredientAmount: '',
        formIngredientUnit: '',
        formIngredientIndex: null,
        formIngredientID: null,
    });
    const [chooseActive, setChooseActive] = useState(false); // toggles between edit and choose ingredient
    const [chosenIngredients, setChosenIngredients] = useState({});

    const { addUserIngredient, removeUserIngredient, getAllUserIngredients, updateUserIngredient } = useContext(FirestoreContext);
    useEffect(() => {
        getAllUserIngredients()
        .then((ingredients) => setFridge(ingredients))
        .catch((err) => console.error(err));
    }, [getAllUserIngredients]);

    const { searchIngredient } = useContext(SpoonacularContext);

    function editIngredient(ingredient, index) {
        setShowForm(true);
        setNewIngredient(false);
        setOriginalTitle(ingredient.name);
        if (ingredient.getClassType() === "Seasoning") {
            setIsSeasoning(true);
            setFormData({
                formIngredientName: ingredient.name,
                formIngredientIndex: index,
                formIngredientID: ingredient.firestoreID,
            })
        } else {
            setIsSeasoning(false);
            setFormData({
                formIngredientName: ingredient.name,
                formIngredientType: ingredient.type,
                formIngredientExp: new Date(ingredient.expirationDate),
                formIngredientAmount: ingredient.quantity.amount,
                formIngredientUnit: ingredient.quantity.unit,
                formIngredientIndex: index,
                formIngredientID: ingredient.firestoreID,
            });
        }
    }

    function handleFormChange(event) {
        const value = event.target.value;
        const name = event.target.name;

        setFormData({
            ...formData,
            [name]: value,
        });
    }

    function handleSubmit(event) {
        event.preventDefault();
        setShowForm(false);
        clearFormData();
    }

    function handleAdd() {
        if (!formFilled()) {
            return;
        }        

        const newElement = isSeasoning
            ? new Seasoning({
                name: formData.formIngredientName,
                spoonacularName: null,
                imageURL: null,
                firestoreID: formData.formIngredientID,
            })
            : new Ingredient({
                name: formData.formIngredientName,
                spoonacularName: null,
                type: formData.formIngredientType,
                expirationDate: formData.formIngredientExp.getTime(),
                quantity: {
                    amount: formData.formIngredientAmount,
                    unit: formData.formIngredientUnit,
                },
                imageURL: null,
                firestoreID: formData.formIngredientID,
            });
        
        const name = formData.formIngredientName;

        if (typeof formData.formIngredientIndex === 'number') {
            searchIngredient(name).then(({ spoonacularName, imageURL }) => {
                if (typeof spoonacularName !== 'undefined') {
                    newElement.spoonacularName = spoonacularName;
                    newElement.imageURL = imageURL;
                }
                return updateUserIngredient(newElement);
            })
            .then(() => getAllUserIngredients())
            .then((userIngredients) => setFridge(userIngredients))
            .catch((err) => console.error(err));
        } else {
            searchIngredient(name).then(({ spoonacularName, imageURL }) => {
                if (typeof spoonacularName !== 'undefined') {
                    newElement.spoonacularName = spoonacularName;
                    newElement.imageURL = imageURL;
                }
                return addUserIngredient(newElement);
            }).then((docRef) => {
                newElement.firestoreID = docRef.id;
                return getAllUserIngredients();
            })
            .then((userIngredients) => setFridge(userIngredients))
            .catch((err) => console.error(err));
        }
    }

    function formFilled() {
        if (isSeasoning) {
            return formData.formIngredientName !== '';
        } // else is ingredient

        let validate = true;
        Object.values(formData).forEach(value => {
            if (value === '') {
                validate = false;
            }
        });

        return validate;
    }

    function clearFormData() {
        setFormData({
            formIngredientName: "",
            formIngredientType: ingredientTypes[0],
            formIngredientExp: new Date(),
            formIngredientAmount: "",
            formIngredientUnit: "",
            formIngredientIndex: null,
            formIngredientID: null,
        });
    }

    function handleRemove() {
        if (typeof formData.formIngredientIndex === 'number') {
            let ingredientToRemove = fridge[formData.formIngredientIndex];
            removeUserIngredient(ingredientToRemove)
                .then(() => getAllUserIngredients())
                .then((userIngredients) => setFridge(userIngredients))
                .catch(err => console.error(err));
        }
    }

    function handleCancel() {
        clearFormData();
        setShowForm(false);
    }

    function handleCreateIngredient(type) {
        if (!showForm || !formFilled()) {
            // if the dialog is already open, do not close the form if we're switching from ingredient to seasoning or vice versa
            if (showForm && (((type === "Ingredient" && isSeasoning)) || (type === "Seasoning" && !isSeasoning))) {
                // do nothing
            } else {
                setShowForm(!showForm);
            }
        }
        setNewIngredient(true);
        type === "Ingredient" ? setIsSeasoning(false) : setIsSeasoning(true);
        clearFormData();
    }

    function chooseIngredients(toggleChoose) {
        setChooseActive(toggleChoose);

        if (!toggleChoose) {
            setChosenIngredients({}); // remove all chosen ingredients from our state
            populateSearch('');
        } else {
            setShowForm(false);
        }
    }

    function chooseIngredient(ingredient, selected) {
        const newChosen = selected ?
            { ...chosenIngredients, [ingredient.firestoreID]: ingredient } :
            { ...chosenIngredients, [ingredient.firestoreID]: null };
        
        setChosenIngredients(newChosen);
        const fridgeSearchStr = Object.values(newChosen).filter((ingredient) => { // get only elements that are non-null
            return ingredient !== null;
        }).map((ingredient) => { // return only the name for each ingredient
            return ingredient.spoonacularName ? ingredient.spoonacularName : ingredient.name;
        }).join(', '); // join them all together, separated by commas

        populateSearch(fridgeSearchStr);
    }

    function renderForm() {
        return (
            <div className="form-dialog">
                <div className="form-dialog-container">
                    <div className="form-title">
                        {newIngredient ?
                            `Add a${isSeasoning ?
                                ' seasoning' :
                                'n ingredient'}` :
                            `Edit ${originalTitle}`}
                    </div>
                    <form className="form" onSubmit={handleSubmit}>
                        <div className="input">
                            <label htmlFor="formIngredientName">Name</label>
                            <input
                                name="formIngredientName"
                                id="formIngredientName"
                                type="text"
                                value={formData.formIngredientName}
                                onChange={handleFormChange}
                                required/>
                        </div>
                        {!isSeasoning && <div className="input">
                            <label htmlFor="formIngredientType">Type</label>
                            <select
                                name="formIngredientType"
                                id="formIngredientType"
                                value={formData.formIngredientType}
                                onChange={handleFormChange}
                                required>
                                {ingredientTypes.map((type, index) => {
                                    return (<option value={type} key={index}>{type}</option>);
                                })}
                            </select>
                        </div>}
                        {!isSeasoning && <div className="input">
                            <label htmlFor="formIngredientAmount">Amount</label>
                            <input
                                name="formIngredientAmount"
                                id="formIngredientAmount"
                                type="number"
                                value={formData.formIngredientAmount}
                                onChange={handleFormChange}
                                required/>
                        </div>}
                        {!isSeasoning && <div className="input">
                            <label htmlFor="formIngredientUnit">Unit</label>
                            <input
                                name="formIngredientUnit"
                                id="formIngredientUnit"
                                type="text"
                                value={formData.formIngredientUnit}
                                onChange={handleFormChange}
                                required/>
                        </div>}
                        {!isSeasoning && <div className="input">
                            <label htmlFor="datePicker">Expiration Date</label>
                            <DatePicker className="datepicker"
                                        id="datepicker"
                                        placeholderText="Click to select date"
                                        minDate={formData.formIngredientExp}
                                        selected={formData.formIngredientExp}
                                        onChange={date => setFormData({...formData, formIngredientExp: date})} />
                        </div>}
                        <div className="button-container">
                            <button className="button add" onClick={() => handleAdd()}>{newIngredient ? "Add" : "Edit"}</button>
                            {!newIngredient && <button className="button remove" onClick={() => handleRemove()}>Remove</button>}
                            <button className="button cancel" onClick={() => handleCancel()}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // create empty elements so that the last ingredient added to the fridge is left aligned with the other ingredients in a grid
    let emptyElements = [];
    if (fridge && fridge.length % ITEM_ROW_LENGTH !== 0) {
        for (let i = 0; i < ITEM_ROW_LENGTH - (fridge.length % ITEM_ROW_LENGTH); i++) {
            emptyElements.push(<div className="empty" key={i}/>);
        }
    }

    const editIngredientClass = ClassNames('button', 'edit-ingredient', {
        active: !chooseActive,
        inactive: chooseActive,
    });
    const chooseIngredientClass = ClassNames('button', 'choose-ingredient', {
        active: chooseActive,
        inactive: !chooseActive,
    });
    
    const addButtonClass = ClassNames('button', {
        active: !chooseActive,
        inactive: chooseActive,
    });

    return (
        <div className="fridge">
            <div className="page-title">
                <div className="page-title-text">
                    Your Fridge
                </div>
                <div className="edit-container">
                    <button className={editIngredientClass} disabled={!chooseActive} onClick={() => chooseIngredients(false)}>Edit Ingredients</button>
                    <button className={chooseIngredientClass} disabled={chooseActive} onClick={() => chooseIngredients(true)}>Choose Ingredients</button>
                </div>
            </div>
            {fridge !== null &&
                <div className="fridge-container">
                    {fridge.length === 0 ?
                        <div className="empty-fridge">Your fridge is currently empty. Add an ingredient to begin!</div> :
                        fridge.map((ingredient, index) =>
                            <Box
                                key={index}
                                ingredient={ingredient}
                                index={index}
                                editIngredient={editIngredient}
                                chooseActive={chooseActive}
                                chooseIngredient={chooseIngredient}
                            />)}
                    {emptyElements}
                </div>}
            <div className="add-container">
                <div className="button-background">
                    <button
                        className={addButtonClass}
                        onClick={() => handleCreateIngredient("Ingredient")}
                        disabled={chooseActive}>
                        Add Ingredient
                    </button>
                </div>
                <div className="button-background">
                    <button
                        className={addButtonClass}
                        onClick={() => handleCreateIngredient("Seasoning")}
                        disabled={chooseActive}>
                        Add Seasoning
                    </button>
                </div>
            </div>
            {showForm ? renderForm() : null}
        </div>
    );
}

function Box({ ingredient, index, editIngredient, chooseActive, chooseIngredient }) {
    const [selected, setSelected] = useState(false);

    // if the user switches to edit ingredient, unselect all options
    useEffect(() => {
        if (!chooseActive) {
            setSelected(false);
        }
    }, [chooseActive]);

    const isSeasoning = ingredient.getClassType() === "Seasoning";
    const expDate = isSeasoning ? null : new Date(ingredient.expirationDate).toLocaleDateString();

    function getDefaultImage(ingredient) {
        let type = ingredient.getClassType() === "Seasoning" ? "Seasoning" : ingredient.type;
        switch(type) {
            case "Meat":
                return meatImage;
            case "Dairy":
                return dairyImage;
            case "Carbs":
                return carbImage;
            case "Fruit":
                return fruitImage;
            case "Vegetable":
                return vegetableImage;
            case "Seasoning":
                return seasoningImage;
            default:
                return carbImage;
        }
    }

    function handleClick(ingredient, index) {
        if (!chooseActive) {
            editIngredient(ingredient, index);
        } else {
            chooseIngredient(ingredient, !selected);
            setSelected(!selected);
        }
    }

    const selectedClass = {
        // selected: selected && chooseActive,
        'not-selected': !selected && chooseActive,
    };
    const imageClass = ClassNames('image', selectedClass);
    const ingredientClass = ClassNames('ingredient', selectedClass);
    const expirationDateClass = ClassNames('expiration-date', selectedClass);

    return (
        <div className="box" onClick={() => handleClick(ingredient, index)}>
            <img className={imageClass}
                src={ingredient.imageURL ? ingredient.imageURL : getDefaultImage(ingredient)}
                alt="Ingredient" />
            <div className={ingredientClass}>
                <div className="name">{ingredient.name} </div>
                {!isSeasoning && <div className="quantity">({ingredient.quantity.amount} {ingredient.quantity.unit})</div>}
            </div>
            <div className={expirationDateClass}>{isSeasoning ? <>&nbsp;</> : `Expires: ${expDate}`}</div>
        </div>
    );
}
