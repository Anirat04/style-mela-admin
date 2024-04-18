import React from 'react';
import AddProductForm from '@/components/addProductForm/AddProductForm';

const AddProduct = () => {

    return (
        <>
            <div
                className='min-h-screen -mt-14 pt-14'
            >
                {/* Form Container */}
                <div className='bg-white max-w-[1200px] mx-auto p-8 mt-8 border rounded-xl shadow-lg'>
                    <AddProductForm></AddProductForm>
                </div>
            </div>
        </>
    );
};

export default AddProduct;