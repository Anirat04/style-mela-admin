import React from 'react';
import AddProductForm from '@/components/addProductForm/AddProductForm';

const AddProduct = () => {

    return (
        <>
            <div
                className='min-h-screen -mt-14 pt-14 bg-[#f5f5f5]'
            >
                {/* Form Container */}
                <div className='max-w-[1200px] mx-auto p-8 mt-8 rounded-xl'>
                    <AddProductForm></AddProductForm>
                </div>
            </div>
        </>
    );
};

export default AddProduct;