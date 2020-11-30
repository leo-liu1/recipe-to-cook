import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import Ingredient from '../components/classes/Ingredient'

import meatImage from '../assets/images/meat.jpg'
import dairyImage from '../assets/images/dairy.jpg'
import carbImage from '../assets/images/carb.jpg'
import fruitImage from '../assets/images/fruit.jpg'
import vegetableImage from '../assets/images/vegetable.jpg'
import seasoningImage from '../assets/images/seasoning.jpg'

import "react-datepicker/dist/react-datepicker.css";

const ITEM_ROW_LENGTH = 4;

export default function Fridge({ ingredients }) {
    document.title = 'Fridge';
    const ingredientTypes = [
        'Meat',
        'Dairy',
        'Vegetable',
        'Fruit',
        'Carbs',
    ];

    const [fridge, setFridge] = useState(ingredients ? ingredients : []);
    const [showForm, setShowForm] = useState(false);
    const [newIngredient, setNewIngredient] = useState(false);
    const [isSeasoning, setIsSeasoning] = useState(false);
    const [formData, setFormData] = useState({
        formIngredientName: '',
        formIngredientType: ingredientTypes[0],
        formIngredientExp: new Date(),
        formIngredientAmount: '',
        formIngredientUnit: '',
        formIngredientIndex: null,
    });

    function editIngredient(ingredient, index) {
        setShowForm(true);
        setNewIngredient(false);
        ingredient.expirationDate ? setIsSeasoning(false) : setIsSeasoning(true);
        setFormData({
            formIngredientName: ingredient.name,
            formIngredientType: ingredient.type,
            formIngredientExp: new Date(ingredient.expirationDate),
            formIngredientAmount: ingredient.quantity.amount,
            formIngredientUnit: ingredient.quantity.unit,
            formIngredientIndex: index,
        });
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

        const newIngredient = new Ingredient({
            name: formData.formIngredientName,
            spoonacularName: null,
            type: isSeasoning ? "Seasoning" : formData.formIngredientType,
            expirationDate: isSeasoning ? undefined : formData.formIngredientExp.getTime(),
            quantity: {
                amount: formData.formIngredientAmount,
                unit: formData.formIngredientUnit,
            },
            imageURL: null,
        });

        const tempIngredients = fridge.slice();
        if (typeof formData.formIngredientIndex === 'number') {
            tempIngredients[formData.formIngredientIndex] = newIngredient;
        } else {
            tempIngredients.push(newIngredient);
        }

        setFridge(tempIngredients);
    }

    function formFilled() {
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
        });
    }

    function handleRemove() {
        const tempIngredients = fridge.slice();
        if (typeof formData.formIngredientIndex === 'number') {
            tempIngredients.splice(formData.formIngredientIndex, 1);
        }
        setFridge(tempIngredients);
    }

    function handleCancel() {
        clearFormData();
        setShowForm(false);
    }

    function handleCreateIngredient(type) {
        if (!showForm || !formFilled()) {
            setShowForm(!showForm);
        }
        setNewIngredient(true);
        type === "Ingredient" ? setIsSeasoning(false) : setIsSeasoning(true);
        clearFormData();
    }

    function renderForm() {
        return (
            <div className="form-dialog">
                <div className="form-dialog-container">
                    <div className="form-title">{newIngredient ? "Add an ingredient" : `Edit ${formData.formIngredientName}`}</div>
                    <form className="form" onSubmit={handleSubmit}>
                        <div className="input">
                            <label>Name</label>
                            <input
                                name="formIngredientName"
                                type="text"
                                value={formData.formIngredientName}
                                onChange={handleFormChange}
                                required/>
                        </div>
                        {!isSeasoning && <div className="input">
                            <label>Type</label>
                            <select
                                name="formIngredientType"
                                value={formData.formIngredientType}
                                onChange={handleFormChange}
                                required>
                                {ingredientTypes.map(type => {
                                    return (<option value={type}>{type}</option>);
                                })}
                            </select>
                        </div>}
                        <div className="input">
                            <label>Amount</label>
                            <input
                                name="formIngredientAmount"
                                type="number"
                                value={formData.formIngredientAmount}
                                onChange={handleFormChange}
                                required/>
                        </div>
                        <div className="input">
                            <label>Unit</label>
                            <input
                                name="formIngredientUnit"
                                type="text"
                                value={formData.formIngredientUnit}
                                onChange={handleFormChange}
                                required/>
                        </div>
                        {!isSeasoning && <div className="input">
                            <label>Expiration Date</label>
                            <DatePicker className="datepicker"
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
    if (fridge.length % ITEM_ROW_LENGTH !== 0) {
        for (let i = 0; i < ITEM_ROW_LENGTH - (fridge.length % ITEM_ROW_LENGTH); i++) {
            emptyElements.push(<div className="empty"/>);
        }
    }

    return (
        <div className="fridge">
            <div className="fridge-container">
                {fridge.map((ingredient, index) =>
                    <Box
                        ingredient={ingredient}
                        index={index}
                        fridgeClick={editIngredient}
                    />)}
                {emptyElements}
            </div>
            <div className="edit-container">
                <button className="button add-ingredient" onClick={() => handleCreateIngredient("Ingredient")}>Add Ingredient</button>
                <button className="button add-seasoning" onClick={() => handleCreateIngredient("Seasoning")}>Add Seasoning</button>
            </div>
            {showForm ? renderForm() : null}
        </div>
    );
}

function Box({ ingredient, index, fridgeClick }) {
    const { expirationDate, imageURL, type, name, quantity } = ingredient;
    const { amount, unit } = quantity;
    const expDate = new Date(expirationDate).toLocaleDateString();

    function getDefaultImage(type) {
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

    return (
        <div className="box" onClick={() => fridgeClick(ingredient, index)}>
            <img className="image"
                src={imageURL ? imageURL : getDefaultImage(type)}
                alt="Ingredient" />
            <div className="ingredient">
                <div className="name">{name} </div>
                <div className="quantity">({amount} {unit})</div>
            </div>
            {expirationDate
                ? <div className="expiration-date">Expires: {expDate}</div>
                : <div className="expiration-date">&nbsp;&nbsp;</div>
            }
        </div>
    );
}
