export interface ColourOption {
    readonly value: string;
    readonly label: string;
    readonly color: string;
    readonly isFixed?: boolean;
    readonly isDisabled?: boolean;
}
// isFixed: true // add this to set as default
// isDisabled: true // add this to disable from the list
export const colourOptions: readonly ColourOption[] = [
    {
        value: "Black", label: "Black", color: "#000000"
    },
    {
        value: "Gray", label: "Gray", color: "#808080"
    },
    {
        value: "Ocean", label: "Ocean", color: "#00B8D9"
    },
    {
        value: "Forest", label: "Forest", color: "#00875A"
    },
    {
        value: "Slate", label: "Slate", color: "#253858"
    },
    {
        value: "Silver", label: "Silver", color: "#666666"
    },
    {
        value: "Cornflower", label: "Cornflower", color: "#6495ED"
    },
    {
        value: "Crimson", label: "Crimson", color: "#DC143C"
    },
    {
        value: "Goldenrod", label: "Goldenrod", color: "#DAA520"
    },
    {
        value: "Violet", label: "Violet", color: "#8A2BE2"
    },
    {
        value: "Lavender", label: "Lavender", color: "#E6E6FA"
    },
    {
        value: "Chocolate", label: "Chocolate", color: "#D2691E"
    },
    {
        value: "Salmon", label: "Salmon", color: "#FA8072"
    },
    {
        value: "Sienna", label: "Sienna", color: "#A0522D"
    },
    {
        value: "Periwinkle", label: "Periwinkle", color: "#CCCCFF"
    },
    {
        value: "Mint", label: "Mint", color: "#98FF98"
    },
    {
        value: "Coral", label: "Coral", color: "#FF7F50"
    },
    {
        value: "Sandy", label: "Sandy", color: "#F4A460"
    },
    {
        value: "Teal", label: "Teal", color: "#008080"
    },
    {
        value: "Ivory", label: "Ivory", color: "#FFFFF0"
    }
];