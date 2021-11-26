
export interface IStage {
    render(currentFrame: number): void;
}

export const changeStage = (assets: object): IStage => ({
    render(n: number) { }
})
