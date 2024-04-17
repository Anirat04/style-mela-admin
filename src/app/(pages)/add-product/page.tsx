"use client"
import React, { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Select, { StylesConfig } from 'react-select';
import { ColourOption, colourOptions } from '../../../data/colorsData'
import { categoryData } from '../../../data/categoryData'
import chroma from "chroma-js";

// TODO: Ensure real data matching
type Inputs = {
    title: string;
    shortDescription: string;
    colors: { value: {}; label: string }[]; // Adjusted type for colors
    brand: string;
    materials: string;
    price: string;
    discount: number;
    listingCategory: []
};



const AddProduct = () => {
    const [formData, setFormData] = useState<Inputs | null>(null);
    const [initPrice, setInitPrice] = useState<number>();
    const [discountPrice, setDiscountPrice] = useState<number>();
    const [finalPrice, setFinalPrice] = useState(initPrice);
    console.log(initPrice);
    console.log(discountPrice);

    const handleFinalPrice = (initPrice: number, discountPrice: number) => {
        const getFinalPrice = initPrice * (1 - discountPrice / 100);
        setFinalPrice(getFinalPrice);
        console.log("This is final", getFinalPrice);
    }

    // Call handleFinalPrice whenever initPrice or discountPrice changes
    useEffect(() => {
        if (initPrice !== undefined && discountPrice !== undefined) {
            handleFinalPrice(initPrice, discountPrice);
        }
    }, [initPrice, discountPrice]);


    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<Inputs>();

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        setFormData(data);
        // console.log(data);
    };

    // For Color Select component
    const colourStyles: StylesConfig<ColourOption, true> = {
        control: (styles) => ({ ...styles, backgroundColor: 'white' }),
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            const color = chroma(data.color);
            return {
                ...styles,
                backgroundColor: isDisabled
                    ? undefined
                    : isSelected
                        ? data.color
                        : isFocused
                            ? color.alpha(0.1).css()
                            : undefined,
                color: isDisabled
                    ? '#ccc'
                    : isSelected
                        ? chroma.contrast(color, 'white') > 2
                            ? 'white'
                            : 'black'
                        : data.color,
                cursor: isDisabled ? 'not-allowed' : 'default',

                ':active': {
                    ...styles[':active'],
                    backgroundColor: !isDisabled
                        ? isSelected
                            ? data.color
                            : color.alpha(0.3).css()
                        : undefined,
                },
            };
        },
        multiValue: (styles, { data }) => {
            const color = chroma(data.color);
            return {
                ...styles,
                backgroundColor: color.alpha(0.1).css(),
            };
        },
        multiValueLabel: (styles, { data }) => ({
            ...styles,
            color: data.color,
        }),
        multiValueRemove: (styles, { data }) => ({
            ...styles,
            color: data.color,
            ':hover': {
                backgroundColor: data.color,
                color: 'white',
            },
        }),
    };

    // For Material options
    const materialOptions = [
        { value: 'Carbon', label: 'Carbon' },
        { value: 'Zinc', label: 'Zinc' },
    ]

    console.log(formData);
    return (
        <>
            <div
                className='min-h-screen -mt-14 pt-14'
            >
                {/* Form Container */}
                <div className='bg-white max-w-[1200px] mx-auto p-8 mt-8 border rounded-xl shadow-lg'>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Title */}
                        <div>
                            <input defaultValue="" placeholder='Type your title here' {...register("title")} />
                        </div>
                        {/* Short Description */}
                        <div>
                            <input defaultValue="" placeholder='Type a short description for your product' {...register("shortDescription")} />
                        </div>
                        {/* Brand */}
                        <div>
                            <input defaultValue="" placeholder='Type a short description for your product' {...register("brand")} />
                        </div>
                        {/* Choose Colors */}
                        <div>
                            <Controller
                                control={control}
                                name="colors"
                                render={({ field: { onChange } }) => (
                                    <Select
                                        closeMenuOnSelect={false}
                                        isMulti
                                        options={colourOptions}
                                        styles={colourStyles}
                                        onChange={onChange}
                                    />
                                )}
                            />
                        </div>
                        {/* Choose materials */}
                        <div>
                            <Controller
                                control={control}
                                name="materials"
                                render={({ field: { onChange } }) => (
                                    <Select
                                        isMulti
                                        onChange={onChange} // send value to hook form
                                        // selected={value}
                                        options={materialOptions}
                                    />
                                )}
                            />
                        </div>
                        {/* Choose materials */}
                        <div>
                            <Controller
                                control={control}
                                name="listingCategory"
                                render={({ field: { onChange } }) => (
                                    <Select
                                        isMulti
                                        onChange={onChange} // send value to hook form
                                        // selected={value}
                                        options={categoryData}
                                    />
                                )}
                            />
                        </div>

                        {/* Input Price */}
                        <div>
                            <input
                                type="number"
                                min={0}
                                {...register("price", { valueAsNumber: true, min: 0 })}
                                placeholder='BDT'
                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const newValue = parseFloat(e.target.value);
                                    setInitPrice(isNaN(newValue) ? undefined : newValue);
                                }}
                            />
                            {errors.price && <span>There is an error</span> as JSX.Element}
                        </div>
                        {/* Discount */}
                        <div>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                placeholder='Discount %' {...register("discount", { valueAsNumber: true, min: 0, max: 100 })}
                                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const newValue = parseFloat(e.target.value);
                                    setDiscountPrice(isNaN(newValue) ? undefined : newValue);
                                }}
                            />
                        </div>
                        {/* Final Price After discount */}
                        <div>
                            <input
                                type="text"
                                readOnly
                                placeholder='Price After Discount'
                                value={finalPrice !== undefined ? finalPrice.toString() : ''}
                            />
                        </div>
                        <input type="submit" />
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddProduct;