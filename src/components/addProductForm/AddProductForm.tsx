"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Select, { StylesConfig } from "react-select";
import CreatableSelect from "react-select/creatable";
import chroma from "chroma-js";
import { useEdgeStore } from "@/lib/edgestore";
import {
  FileState,
  MultiImageDropzone,
} from "@/components/ImageUpload/multi-image-dropzone";
import { ColourOption, colourOptions } from "@/data/colorsData";
import { categoryData } from "@/data/categoryData";
import DescriptionComponent from "../DescriptionComponent/DescriptionComponent";
import useAxiosPublic from "@/utils/Hooks/useAxiosPublic";
import Swal from "sweetalert2";

// TODO: Ensure real data matching
type Inputs = {
  images: { url: string; thumbnail?: boolean | undefined }[];
  title: string;
  shortDescription: string;
  colors: { value: {}; label: string }[];
  brand: string;
  materials: string;
  price: string;
  discount: number;
  listingCategory: [];
  description: string;
  stockQuantity: number;
};

const AddProductForm = () => {
  const [formData, setFormData] = useState<Inputs | null>(null);
  const [initPrice, setInitPrice] = useState<number | undefined>(undefined);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(
    undefined
  );
  const [finalPrice, setFinalPrice] = useState<any>(initPrice);
  const [receivedValue, setReceivedValue] = useState("");
  const [updatedFormData, setUpdatedFormData] = useState({ ...formData });
  // console.log(initPrice);
  // console.log(discountPrice);

  // for multiple images upload
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const { edgestore } = useEdgeStore();

  // Function to handle image upload
  const handleUploadImages = async () => {
    const uploadedImageURLs: { url: string; thumbnail?: boolean }[] = [];

    await Promise.all(
      fileStates.map(async (fileState, index) => {
        try {
          if (typeof fileState.file !== "string") {
            // Check if file is not a string
            const res = await edgestore.publicFiles.upload({
              file: fileState.file,
              onProgressChange: async (progress) => {
                updateFileProgress(fileState.key, progress);
                if (progress === 100) {
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  updateFileProgress(fileState.key, "COMPLETE");
                }
              },
            });
            uploadedImageURLs.push({ url: res.url, thumbnail: index === 0 });
          }
        } catch (err) {
          updateFileProgress(fileState.key, "ERROR");
        }
      })
    );

    // setGetImageArray(uploadedImageURLs);
    return uploadedImageURLs;
  };
  // console.log(getImageArray);

  function updateFileProgress(key: string, progress: FileState["progress"]) {
    setFileStates((fileStates) => {
      const newFileStates = [...fileStates];
      const fileStateIndex = newFileStates.findIndex(
        (fileState) => fileState.key === key
      );
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

  // For receiving markdown

  const handleValueReceived = (value: any) => {
    setReceivedValue(value);
  };
  // console.log(receivedValue);
  useEffect(() => {
    // Update the description field in the formData with the receivedValue
    setUpdatedFormData((formData) => ({
      ...formData,
      description: receivedValue,
    }));
  }, [receivedValue]);

  const handleFinalPrice = (initPrice: number, discountPrice: number) => {
    const getFinalPrice = initPrice * (1 - discountPrice / 100);
    setFinalPrice(getFinalPrice);
    // console.log("This is final", getFinalPrice);
  };

  // Call handleFinalPrice whenever initPrice or discountPrice changes
  // Call handleFinalPrice whenever initPrice or discountPrice changes
  useEffect(() => {
    if (initPrice !== undefined && discountPrice !== undefined) {
      handleFinalPrice(initPrice, discountPrice);
    } else {
      setFinalPrice(initPrice); // Set final price to undefined if either initPrice or discountPrice is undefined
    }
  }, [initPrice, discountPrice]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    // Step 1: Get the uploaded image URLs
    const uploadedImageURLs = await handleUploadImages();

    // Step 2: Include the received description in form data
    const updatedData = {
      ...data,
      images: uploadedImageURLs, // Include uploaded images
      description: receivedValue, // Include received description
    };
    await setFormData(updatedData); // Set the updated form data
    reset();
  };

  // For Color Select component
  const colourStyles: StylesConfig<ColourOption, true> = {
    control: (styles) => ({ ...styles, backgroundColor: "white" }),
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
          ? "#ccc"
          : isSelected
          ? chroma.contrast(color, "white") > 2
            ? "white"
            : "black"
          : data.color,
        cursor: isDisabled ? "not-allowed" : "default",

        ":active": {
          ...styles[":active"],
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
      ":hover": {
        backgroundColor: data.color,
        color: "white",
      },
    }),
  };

  // For Material options
  const materialOptions = [
    { value: "Carbon", label: "Carbon" },
    { value: "Zinc", label: "Zinc" },
  ];

  // console.log(formData);

  // Add Product
  const AddProduct = useCallback(async () => {
    try {
      const ProductData = formData;

      const response = await fetch("http://localhost:5000/add-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ProductData }),
      });

      if (!response.ok) {
        throw new Error("Failed to save Product data");
      } else {
        Swal.fire({
          title: `Your product has been saved.`,
          timer: 2000,
          color: "#FA8C16",
          showConfirmButton: false,
          icon: "success",
        });
      }

      const data = await response.json();
      console.log(data); // Response from the server
    } catch (error) {
      console.error("Error posting Product data:", error);
    }
  }, [formData]);

  useEffect(() => {
    if (formData !== null) {
      AddProduct();
    }
  }, [AddProduct, formData]);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white dark:bg-gray-800 dark:text-white p-5 rounded-md text-3xl font-semibold shadow-lg text-center">
          <p>Add Product Form</p>
        </div>

        {/* Image Uploading Div */}
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg p-5 mt-6">
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

        {/* Product Information title, short description & description */}
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg p-5 mt-6">
          <div className="font-medium my-3 text-2xl text-gray-900 dark:text-white">
            <p>Product Information</p>
          </div>
          <div className="grid gap-5 pb-5">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block mb-1 font-medium text-gray-900 dark:text-white"
              >
                Title
              </label>
              <input
                className="px-3 py-2 outline-0p-2.5 w-full text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 dark:placeholder-gray-400 outline-0"
                placeholder="Product Title"
                {...register("title")}
              />
            </div>

            {/* Short Description */}
            <div>
              <label
                htmlFor="shortDescription"
                className="block mb-1  font-medium text-gray-900 dark:text-white"
              >
                Short Description
              </label>
              <textarea
                id="shortDescription"
                className="block p-2.5 w-full text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 dark:placeholder-gray-400 outline-0"
                placeholder="Type here..."
                {...register("shortDescription", {
                  required: true,
                  minLength: 30,
                  maxLength: 500,
                })}
              />
              {errors.shortDescription &&
                errors.shortDescription.type === "required" && (
                  <span>This is required</span>
                )}
              {errors.shortDescription &&
                errors.shortDescription.type === "maxLength" && (
                  <span>Max length exceeded</span>
                )}
              {errors.shortDescription &&
                errors.shortDescription.type === "minLength" && (
                  <span>Min length exceeded</span>
                )}
            </div>

            {/* Description editor starts here */}
            <div>
              <label
                htmlFor="DetailedDescription"
                className="block mb-1  font-medium text-gray-900 dark:text-white"
              >
                Detailed Description
              </label>
              <DescriptionComponent
                sendValueToParent={handleValueReceived}
              ></DescriptionComponent>
            </div>
            {/* Description editor ends here */}
          </div>
        </div>

        {/* Additional information Brand, Colors, Materials, Category */}
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg p-5 mt-6">
          <div className="font-medium my-3 text-2xl text-gray-900 dark:text-white">
            <p>Additional Information</p>
          </div>
          <div className="grid grid-cols-2 gap-5 pb-5">
            {/* Brand */}
            <div>
              <label
                htmlFor="brand"
                className="block mb-1 font-medium text-gray-900 dark:text-white"
              >
                Brand
              </label>
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
              <label
                htmlFor="colors"
                className="block mb-1 font-medium text-gray-900 dark:text-white"
              >
                Colors
              </label>
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
              <label
                htmlFor="materials"
                className="block mb-1 font-medium text-gray-900 dark:text-white"
              >
                Materials
              </label>
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
              <label
                htmlFor="Category"
                className="block mb-1 font-medium text-gray-900 dark:text-white"
              >
                Category
              </label>
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
          </div>
        </div>

        {/* Price and Stock */}
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg p-5 mt-6">
          <div className="font-medium my-3 text-2xl text-gray-900 dark:text-white">
            <p>Price & Stock</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* Input Price */}
            <div>
              <label
                htmlFor="Price"
                className="block mb-1 font-medium text-gray-900 dark:text-white"
              >
                Price
              </label>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-[3px] outline-0 px-2 h-[36px] dark:bg-gray-700 dark:text-white"
                type="number"
                min={0}
                {...register("price", { valueAsNumber: true, min: 0 })}
                placeholder="BDT"
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const newValue = parseFloat(e.target.value);
                  setInitPrice(isNaN(newValue) ? undefined : newValue);
                }}
              />
              {errors.price &&
                ((<span>There is an error</span>) as JSX.Element)}
            </div>
            {/* Discount */}
            <div>
              <label
                htmlFor="Discount Percentage"
                className="block mb-1 font-medium text-gray-900 dark:text-white"
              >
                Discount Percentage
              </label>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-[3px] outline-0 px-2 h-[36px] dark:bg-gray-700 dark:text-white"
                type="number"
                min={0}
                max={100}
                placeholder="Discount %"
                {...register("discount", {
                  valueAsNumber: true,
                  min: 0,
                  max: 100,
                })}
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const newValue = parseFloat(e.target.value);
                  setDiscountPrice(isNaN(newValue) ? undefined : newValue);
                }}
              />
            </div>
            {/* Final Price After discount */}
            <div>
              <label
                htmlFor="Final Price"
                className="block mb-1 font-medium text-gray-900 dark:text-white"
              >
                Final Price
              </label>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-[3px] outline-0 px-2 h-[36px] dark:bg-gray-700 dark:text-white"
                type="text"
                readOnly
                placeholder="Price After Discount"
                value={finalPrice !== undefined ? finalPrice.toString() : ""}
              />
            </div>
            {/* Stock quantity */}
            <div>
              <label
                htmlFor="Stock Quantity"
                className="block mb-1 font-medium text-gray-900 dark:text-white"
              >
                Stock Quantity
              </label>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-[3px] outline-0 px-2 h-[36px] dark:bg-gray-700 dark:text-white"
                type="number"
                min={0}
                {...register("stockQuantity", { valueAsNumber: true, min: 0 })}
                placeholder="Quantity"
              />
              {errors.price &&
                ((<span>There is an error</span>) as JSX.Element)}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 mt-6 rounded-md shadow-xl mb-12">
          <input
            className="w-full p-5 text-3xl dark:text-white cursor-pointer"
            type="submit"
          />
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;
