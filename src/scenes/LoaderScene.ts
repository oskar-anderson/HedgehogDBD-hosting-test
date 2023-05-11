import { Container, Graphics, Loader } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { DrawScene } from "./DrawScene";
import { AppState } from "../components/MainContent";
import EnvGlobals from "../../EnvGlobals";
import { Draw } from "../model/Draw";

export class LoaderScene extends Container implements IScene {

    // for making our loader graphics...
    private loaderBar: Container;
    private loaderBarBorded: Graphics;
    private loaderBarFill: Graphics;

    constructor(width: number, height: number, draw: Draw) {
        super();
        const loaderBarWidth = width * 0.8;
        Manager.getInstance().draw = draw;

        this.loaderBarFill = new Graphics();
        this.loaderBarFill.beginFill(0x008800, 1)
        this.loaderBarFill.drawRect(0, 0, loaderBarWidth, 50);
        this.loaderBarFill.endFill();
        this.loaderBarFill.scale.x = 0;

        this.loaderBarBorded = new Graphics();
        this.loaderBarBorded.lineStyle(10, 0x0, 1);
        this.loaderBarBorded.drawRect(0, 0, loaderBarWidth, 50);

        this.loaderBar = new Container();
        this.loaderBar.addChild(this.loaderBarFill);
        this.loaderBar.addChild(this.loaderBarBorded);
        this.loaderBar.position.x = (width - this.loaderBar.width) / 2;
        this.loaderBar.position.y = (height - this.loaderBar.height) / 2;
        this.addChild(this.loaderBar);

        Loader.shared.add(EnvGlobals.BASE_URL + '/wwwroot/font/consolas/consolas-24-xml-white-text-with-alpha-padding0-spacing1.fnt');

        Loader.shared.onProgress.add((loader) => {
            let progressRatio = loader.progress / 100;
            this.loaderBarFill.scale.x = progressRatio;
        });
        Loader.shared.onComplete.once((loader) => { 
            let scene = new DrawScene(draw)
            Manager.getInstance().changeScene(scene);
        });

        Loader.shared.load();
    }

        
    getState(): AppState {
        return AppState.LoaderScene;
    }
}
