import React, { useContext, useRef } from "react";
import { FirestoreContext } from '../handlers/FirestoreHandler';

export default function RecipeBox({ recipe, removeFromHistoryPage }) {
    const { addRecipeHistory, removeRecipeHistory } = useContext(FirestoreContext);
    const redirectButton = useRef();

    const addToHistoryAndRedirect = async () => {
        await addRecipeHistory(recipe).catch(err => console.error(err));
        redirectButton.current.click();
    };

    const removeFromHistory = async () => {
        await removeRecipeHistory(recipe).catch(err => console.error(err));
        removeFromHistoryPage(recipe);
    };

    if (typeof recipe.ingredients === 'undefined' || typeof recipe.missingIngredients === 'undefined') {
        return (<div className="">Error: could not load recipe</div>);
    }

    const ingredientsElement = recipe.ingredients
        .map((ingredient) => <div key={ingredient.spoonacularName} className="ingredient">{ingredient.name}</div>);
    
    const missingIngredientsElement = recipe.missingIngredients
        .map((ingredient) => <div key={ingredient.spoonacularName} className="ingredient">{ingredient.name}</div>);

    return (
        <div className="recipe-box">
            <div className="image-container">
                <img className="image"
                    src={recipe.imageURL}
                    alt={recipe.name} />
                <div className="button-container">
                    <button className="button add" onClick={addToHistoryAndRedirect}>Go to Recipe</button>
                    {typeof removeFromHistoryPage !== 'undefined' &&
                    <button className="button" onClick={removeFromHistory}>Remove Recipe From History</button>}
                </div>
            </div>
            <div className="content-container">
                <div className="content">
                    <div className="title">
                        <div className="name">{recipe.name}</div>
                    </div>
                    <div className="ingredients-container">
                        <div className="ingredients">
                            <div className="text">
                                Ingredients:
                            </div>
                            {ingredientsElement}
                        </div>
                        <div className="ingredients">
                            <div className="text">
                                Missing Ingredients:
                            </div>
                            {missingIngredientsElement}
                        </div>
                    </div>
                </div>
            </div>
            <form action={recipe.recipeURL} target="_blank" className="hidden"><button ref={redirectButton}></button></form>
        </div>
    );
}
