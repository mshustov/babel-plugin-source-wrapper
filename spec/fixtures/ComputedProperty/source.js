const FOO = {
    [props.FOO]: 1,
    [props.BAR]: () => 2
};

export let BAR = {
    [props.FOO]: 1,
    [props.BAR]: () => 2
};

fn({
    [props.FOO]: 1,
    [props.BAR]: () => 2
});
