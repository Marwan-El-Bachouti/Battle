

var user_info;
let resources;

let troop_array = []
let troops = [];
let buildings_array = [];
let buildings = [];

let end_turn_button;
let train_troop_button;
let board_size = 16
let tilesize = 43 //700 / board_size;
let matrix = [];

let its_my_turn;

let dice_number = '';

let update_interval = 1000;
let update_timer = 0;

const radius = tilesize / 2;
const diameter = radius * 2;

window.onload = async () => {

    user_info = await get_user_info();
    resources = await get_resources_by_id(1, user_info.user_id);
    

    await initialize_game()
    for (let i = 0; i < troops.length; i++) {

        let temp_troop = new troop(
            troops[i].user_id,
            troops[i].user_trp_id,
            troops[i].trp_name,
            troops[i].troop_current_health,
            troops[i].trp_movement,
            troops[i].troop_current_movement,
            troops[i].trp_attack,
            troops[i].trp_range,
            troops[i].trp_max_amount,
            troops[i].troop_x,
            troops[i].troop_y)
        troop_array.push(
            temp_troop,
        );
    }

    for (let i = 0; i < buildings.length; i++) {
        let temp_building = new building(
            buildings[i].user_id,
            buildings[i].user_bld_id,
            buildings[i].bld_id,
            buildings[i].bld_name,
            buildings[i].bld_health,
            buildings[i].bld_x,
            buildings[i].bld_y)
        buildings_array.push(
            temp_building,
        );
    }



    let bol = await check_current_playing()
    if (bol[0].current_user_playing == user_info.user_id) {
        its_my_turn = true;
        enable_button(train_troop_button)
        enable_button(end_turn_button)
    } else {
        its_my_turn = false;
        disable_button(train_troop_button)
        disable_button(end_turn_button)

    }
    document.getElementById("name").innerHTML = user_info.username;
    document.getElementById("id").innerHTML = user_info.user_id;
    document.getElementById("iron").innerHTML = resources[0].rsc_amount;
    document.getElementById("food").innerHTML = resources[1].rsc_amount;



}

async function setup() {
    troop_setup()
    building_setup()
    let cnv = createCanvas(board_size*tilesize, board_size*tilesize);
    cnv.position(700, 30);
    //tilesize = width / board_size;

    let pos = 0;
    for (let x = 0; x < board_size; x++) {
        matrix[x] = []
        for (let y = 0; y < board_size; y++) {
            pos++;
            matrix[x][y] = pos;
        }
    }
    end_turn_button = createButton('End Turn');
    end_turn_button.position(500, 155);
    end_turn_button.mousePressed(end_turn);

    train_troop_button = createButton('train troop');
    train_troop_button.position(500, 245);
    train_troop_button.mousePressed(async function () {
        let result = await train_troop(user_info.user_id, 1, 5, 2, buildings, resources)
        if (result.inserted) {
            alert('a')
            //document.location.reload(true)
        }
    });

}

async function draw() {

    if (!its_my_turn) {
        if (update_timer == update_interval)
        {
            initialize_game();
            update_time = 0;
        }
        else
            update_timer += deltaTime;
    }

    if (user_info == undefined)
        return;

    background("black");
    let square_size = tilesize; //width / board_size;
    let num_squares = 0;
    let c = color(255, 204, 0);
    let w = color('white');
    let b = color('black');
    let r = color('red');
    let p = color('purple');
    let bl = color('blue');
    let g = color('gray');
    let hovered_tile = mouse_over_tile();

    for (let y = 0; y < height; y += square_size) {
        for (let x = 0; x < width; x += square_size) {
            if (hovered_tile.x * square_size == x && hovered_tile.y * square_size == y) {
                //if (matrix[hovered_tile.y][hovered_tile.x -1] == num_squares) {
                fill(p)
                rect(x, y, square_size, square_size);
                fill(w)
            } else {
                rect(x, y, square_size, square_size);
            }


            fill(b);
            text(num_squares, x + square_size / 2 - 10, y + square_size / 2)
            fill(w)
            num_squares++
            draw_buildings(matrix, buildings_array, num_squares, user_info.user_id, square_size, tilesize, x, y)
            draw_troops(matrix, troop_array, num_squares, user_info.user_id, square_size, diameter, x, y)
        }
    }
}

async function keyPressed() {
    await key_troops(its_my_turn, troop_array, user_info.user_id)
    await key_buildings(its_my_turn, troop_array, user_info.user_id, resources)
}

function mousePressed() {
    let y = (int)(mouseX / tilesize)
    let x = (int)(mouseY / tilesize)
    mouse_pressed_troops(troop_array)


    mouse_pressed_buildings(buildings_array, x, y)


}

async function check_current_playing() {
    let current_playing = await check_current_playing_by_game(1)
    return current_playing;
}

async function end_turn() {
    let resources_per_turn = 2

    for (let i = 0; i < buildings.length; i++) {
        if (buildings[i].user_id == user_info.user_id) {
            if (buildings[i].bld_name == 'Mine') {
                await update_resources_id(user_info.user_id, resources[0].rsc_amount + resources_per_turn, 1)
            }
            if (buildings[i].bld_name == 'Field') {
                await update_resources_id(user_info.user_id, resources[1].rsc_amount + resources_per_turn, 2)
            }
        }
    }
    for (let i = 0; i < troop_array.length; i++) {
        troop_array[i].movement = troop_array[i].init_movement
        await update_troops_id(
            user_info.user_id,
            troop_array[i].user_trp_id,
            troop_array[i].x, troop_array[i].y,
            troop_array[i].health, troop_array[i].movement);
    }
    let bol = await check_current_playing()
    console.log(bol)
    if (bol[0].current_user_playing == user_info.user_id) {
        console.log('end_turn')
        if (user_info.user_id == 2) {
            await update_current_playing(1, 1)

        } else {
            await update_current_playing(1, 2);
        }
        opponent_turn()
    } else {
        await update_current_playing(1, user_info.user_id);
        your_turn()
    }
    document.location.reload(true)
}

async function your_turn() {
    its_my_turn = true;
    end_turn_button.removeAttribute('disabled')
    train_troop_button.removeAttribute('disabled')
}

function opponent_turn() {
    console.log('o')
    its_my_turn = false;
    end_turn_button.attribute('disabled', '');
    train_troop_button.attribute('disabled', '');
}

function toggle_button(button) {
    if (button.hasAttribute('disabled')) {
        button.removeAttribute('disabled')
    } else button.attribute('disabled', '');
}

function enable_button(button) {
    button.removeAttribute('disabled')
}

function disable_button(button) {
    button.attribute('disabled', '');
}

function mouse_over_tile() {
    let x = mouseX > 0 ? (int)(mouseX / tilesize) : -1
    let y = mouseY > 0 ? (int)(mouseY / tilesize) : -1

    return { x: x, y: y };
}

async function initialize_game() {
    buildings = await get_buildings_by_id(1);
    troops = await get_troops_by_id(1);

}
