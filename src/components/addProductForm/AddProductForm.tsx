"use client"
import React, { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Select, { StylesConfig } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import chroma from "chroma-js";
import { useEdgeStore } from '@/lib/edgestore';
import { FileState, MultiImageDropzone } from '@/components/ImageUpload/multi-image-dropzone';
import { ColourOption, colourOptions } from '@/data/colorsData';
import { categoryData } from '@/data/categoryData';


// TODO: Ensure real data matching
// type Inputs = {
//     title: string;
//     shortDescription: string;
//     colors: { value: {}; label: string }[]; // Adjusted type for colors
//     brand: string;
//     materials: string;
//     price: string;
//     discount: number;
//     listingCategory: []
//     images: []
// };
type Inputs = {
    images: { url: string; thumbnail?: boolean | undefined; }[];
    title: string; shortDescription: string;
    colors: { value: {}; label: string; }[];
    brand: string;
    materials: string;
    price: string;
    discount: number;
    listingCategory: [];
};

const AddProductForm = () => {
    const [formData, setFormData] = useState<Inputs | null>(null);
    const [initPrice, setInitPrice] = useState<number>();
    const [discountPrice, setDiscountPrice] = useState<number>();
    const [finalPrice, setFinalPrice] = useState(initPrice);
    // console.log(initPrice);
    // console.log(discountPrice);

    // for multiple images upload
    const [getImageArray, setGetImageArray] = useState<{ url: string; thumbnail?: boolean }[]>([]);
    const [fileStates, setFileStates] = useState<FileState[]>([]);
    const { edgestore } = useEdgeStore();

    // Function to handle image upload
    const handleUploadImages = async () => {
        const uploadedImageURLs: { url: string; thumbnail?: boolean }[] = [];

        await Promise.all(
            fileStates.map(async (fileState, index) => {
                try {
                    if (typeof fileState.file !== 'string') { // Check if file is not a string
                        const res = await edgestore.publicFiles.upload({
                            file: fileState.file,
                            onProgressChange: async (progress) => {
                                updateFileProgress(fileState.key, progress);
                                if (progress === 100) {
                                    await new Promise((resolve) => setTimeout(resolve, 1000));
                                    updateFileProgress(fileState.key, 'COMPLETE');
                                }
                            },
                        });
                        uploadedImageURLs.push({ url: res.url, thumbnail: index === 0 });
                    }
                } catch (err) {
                    updateFileProgress(fileState.key, 'ERROR');
                }
            })
        );

        // setGetImageArray(uploadedImageURLs);
        return uploadedImageURLs;
    };
    // console.log(getImageArray);

    function updateFileProgress(key: string, progress: FileState['progress']) {
        setFileStates((fileStates) => {
            const newFileStates = [...fileStates];
            const fileStateIndex = newFileStates.findIndex((fileState) => fileState.key === key);
            if (fileStateIndex !== -1) {
                newFileStates[fileStateIndex] = {
                    ...newFileStates[fileStateIndex],
                    progress: progress,
                };
            }
            return newFileStates;
        });
    }
    // Image Uploads ends


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

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        const uploadedImageURLs = await handleUploadImages(); // Get the uploaded images array
        const updatedData = { ...data, images: uploadedImageURLs };
        console.log(uploadedImageURLs); // Include images in form data
        await setFormData(updatedData); // Set the updated form data
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
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Image Uploading Div */}
                <div>
                    <div>
                        <div>
                            <Controller
                                name="images"
                                control={control}
                                render={({ field }) => (
                                    <MultiImageDropzone
                                        value={fileStates}
                                        dropzoneOptions={{
                                            maxFiles: 6,
                                        }}
                                        onChange={(files) => {
                                            setFileStates(files);
                                            field.onChange(files);
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div>
                    <input defaultValue="" placeholder='Type your title here' {...register("title")} />
                </div>

                {/* Brand */}
                <div>
                    <Controller
                        control={control}
                        name="brand"
                        render={({ field: { onChange } }) => (
                            <CreatableSelect
                                isClearable
                                onChange={onChange}
                                placeholder="Select or Add a brand"
                            // TODO: Add proper options for brand names
                            // options={colourOptions}
                            />
                        )}
                    />
                </div>
                {/* Choose Colors */}
                <div>
                    <Controller
                        control={control}
                        name="colors"
                        render={({ field: { onChange } }) => (
                            <Select
                                placeholder="Select product color variants"
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
                                placeholder="Select materials"
                                isMulti
                                onChange={onChange} // send value to hook form
                                // selected={value}
                                options={materialOptions}
                            />
                        )}
                    />
                </div>
                {/* Choose Product category */}
                <div>
                    <Controller
                        control={control}
                        name="listingCategory"
                        render={({ field: { onChange } }) => (
                            <Select
                                placeholder="Select Category"
                                isMulti
                                onChange={onChange} // send value to hook form
                                // selected={value}
                                options={categoryData}
                            />
                        )}
                    />
                </div>


                {/* Short Description */}
                <div>
                    {/* <input type='text' placeholder='Type a short description for your product' {...register("shortDescription")} /> */}
                    <textarea id='shortDescription' placeholder='Type a short description for your product' {...register("shortDescription", { required: true, minLength: 5, maxLength: 10 })} />
                    {errors.shortDescription && errors.shortDescription.type === "required" && <span>This is required</span>}
                    {errors.shortDescription && errors.shortDescription.type === "maxLength" && <span>Max length exceeded</span>}
                    {errors.shortDescription && errors.shortDescription.type === "minLength" && <span>Min length exceeded</span>}
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
    );
};

export default AddProductForm;