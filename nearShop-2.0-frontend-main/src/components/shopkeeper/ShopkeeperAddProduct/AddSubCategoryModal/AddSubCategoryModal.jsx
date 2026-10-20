import { useState } from "react";
import axios from "axios";
import { Links } from "react-router-dom";
import { LINKS } from "../../../../constants/LinksUtility";
import Loading from "../../../Loading/Loading";

function AddSubCategoryModal({ setShowModal, refreshSubCategories}) {

    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [loading,setLoading] = useState(false);

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        const payload = {
            name: name,
            isActive: isActive
        };

        try {
            const response = await axios.post(
                `${LINKS.API_BASE_URL}/api/shop/addShopSubCategory`,
                payload,
                { withCredentials: true }
            );
                        refreshSubCategories();

            alert(response.data);

            setShowModal(false);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    return (
        <div className="overlay">

            <div className="modal">

                <h2>Add Subcategory</h2>
                {loading && (<Loading></Loading>)}
                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        placeholder="Subcategory Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <label>
                        Active
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                    </label>

                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setShowModal(false)}>
                        Cancel
                    </button>
                </form>

            </div>

        </div>
    );
}

export default AddSubCategoryModal;