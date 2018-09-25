import { CSSProperties, Component, createElement } from "react";
import { Alert } from "./Alert";
// tslint:disable-next-line:no-submodule-imports
import * as SignaturePad from "signature_pad/dist/signature_pad.min";
import "../ui/Signature.scss";

export interface SignatureProps {
    alertMessage?: string;
    widthUnit?: widthUnitType;
    heightUnit?: heightUnitType;
    height?: number;
    width?: number;
    gridx?: number;
    gridy?: number;
    gridColor?: string;
    gridBorder?: number;
    penColor?: string;
    maxLineWidth?: string;
    minLineWidth?: string;
    velocityFilterWeight?: string;
    showGrid?: boolean;
    onClickAction?: (imageUrl?: string) => void;
    style?: object;
}

export interface SignatureState {
    isSet: boolean;
    isGridDrawn: boolean;
}

export type heightUnitType = "percentageOfWidth" | "pixels" | "percentageOfParent";
export type widthUnitType = "percentage" | "pixels";

export class Signature extends Component<SignatureProps, SignatureState> {
    private canvasNode: HTMLCanvasElement;
    private signaturePad: any;
    private width: number;
    private height: number;

    constructor(props: SignatureProps) {
        super(props);

        this.state = {
            isSet: false,
            isGridDrawn: false
        };
    }

    render() {
        return createElement("div", {
            className: "widget-signature-wrapper",
            style: this.getStyle(this.props)
        },
        createElement("canvas", {
            width: this.width,
            height: this.height,
            ref: this.getCanvas,
            resize: true,
            style: { border: this.props.gridBorder + "px solid black" }
        }),
        createElement("button", {
            className: "btn btn-default",
            onClick: this.resetCanvas
        }, "Reset"),
        createElement("button", {
            className: "btn btn-primary",
            onClick: () => this.getDataUrl(),
            style: { visibility: this.state.isSet ? "visible" : "hidden" }
        }, "Save"),
        createElement(Alert, { bootstrapStyle: "danger" }, this.props.alertMessage)
        );
    }

    componentDidMount() {
        if (this.canvasNode) {
            this.canvasNode.style.backgroundColor = "white";
            this.signaturePad = new SignaturePad(this.canvasNode, {
                onEnd: () => { this.setState({ isSet: true }); },
                backgroundColor: "white",
                penColor: this.props.penColor,
                velocityFilterWeight: this.props.velocityFilterWeight,
                maxWidth: this.props.maxLineWidth,
                minWidth: this.props.minLineWidth
            });

            if (this.canvasNode.parentElement) {
                this.height = this.canvasNode.parentElement.clientHeight;
                this.width = this.canvasNode.parentElement.clientWidth;
            }
        }
    }

    componentDidUpdate() {
        if (this.props.showGrid && !this.state.isGridDrawn) {
            this.drawGrid();
            this.setState({ isGridDrawn: true });
        }
    }

    private getDataUrl = () => {
        this.props.onClickAction(this.signaturePad.toDataURL());
    }

    private getCanvas = (node: HTMLCanvasElement) => {
        this.canvasNode = node;
    }

    private resetCanvas = () => {
        this.signaturePad.clear();
        this.setState({ isSet: false , isGridDrawn: false });
    }

    private drawGrid = () => {
        const { showGrid, gridColor, gridx, gridy } = this.props;
        if (!showGrid) return;

        if (this.width && this.height) {
            let x = gridx;
            let y = gridy;
            const context = this.canvasNode.getContext("2d") as CanvasRenderingContext2D;
            context.beginPath();

            for (; x < this.width; x += gridx) {
                context.moveTo(x, 0);
                context.lineTo(x, this.height);
            }

            for (; y < this.height; y += gridy) {
                context.moveTo(0, y);
                context.lineTo(this.width, y);
            }

            context.lineWidth = 1;
            context.strokeStyle = gridColor;
            context.stroke();
        }
    }

    private getStyle(props: SignatureProps): object {
        const style: CSSProperties = {
            width: props.widthUnit === "percentage" ? `${props.width}%` : `${props.width}px`
        };
        if (props.heightUnit === "percentageOfWidth") {
            style.paddingBottom = props.widthUnit === "percentage"
                ? `${props.height}%`
                : `${props.width / 2}px`;
        } else if (props.heightUnit === "pixels") {
            style.height = `${props.height}px`;
        } else if (props.heightUnit === "percentageOfParent") {
            style.height = `${props.height}%`;
        }

        return { ...style, ...this.props.style };
    }
}
