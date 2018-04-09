/**
 *      BASIC POLYGON CREATION AND EDITING
 * 
 */

/**
 * Creates a new triangle with Mat1x4's to represent each point
 * 
 * @param a 
 * Mat1x4 that stores point 'a' matrix
 * 
 * @param b 
 * Mat1x4 that stores point 'b' matrix
 * 
 * @param c 
 * Mat1x4 that stores point 'c' matrix
 */
function Triangle(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
}

/**
 * Allows the setting of all point matrices for a triangle.
 * 
 * @param a 
 * new Mat1x4 that stores point 'a' matrix 
 * 
 * @param b 
 * new Mat1x4 that stores point 'b' matrix
 * 
 * @param c 
 * new Mat1x4 that stores point 'c' matrix 
 * 
 */
Triangle.prototype.setMatrices = function(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
}

/**
 * Returns the matrices of each point in the triangle in an array.
 * 
 * @returns 
 * Array<Mat1x4> -- The matrices in an array [a, b, c]
 * 
 */
Triangle.prototype.getMatrices = function() {
    return [this.a.matrix, this.b.matrix, this.c.matrix];
}

/**
 * Returns a new Rectangle that is the smallest enclosing rectangle for the triangle.
 * 
 * @returns 
 * Rectangle -- Smallest possible rectangle bounding the triangle
 * 
 */
Triangle.prototype.getBoundingRect = function() {
    //get smallest X and Y values to get the top left corner of the rectangle
    let minX = Math.min(this.a.matrix[0], Math.min(this.b.matrix[0], this.c.matrix[0]));
    let minY = Math.min(this.a.matrix[1], Math.min(this.b.matrix[1], this.c.matrix[1]));

    //get largest X and Y values for bottom right corner of rectangle
    let maxX = Math.max(this.a.matrix[0], Math.max(this.b.matrix[0], this.c.matrix[0]));
    let maxY = Math.max(this.a.matrix[1], Math.max(this.b.matrix[1], this.c.matrix[1]));

    //get width and height
    let width = maxX - minX;
    let height = maxY - minY;

    //return bounding rectangle
    return new Rectangle(minX, minY, width, height);
}

/**
 * Translates each point of the triangle by a given Mat1x4 vector.
 * 
 * @param {*} transMat 
 * Mat1x4 that stores <x, y, z, w> translation for each point of the triangle
 * 
 */
Triangle.prototype.translate = function(transMat) {
    this.a.add1x4(transMat);
    this.b.add1x4(transMat);
    this.c.add1x4(transMat);
}

/**
 * Rotates triangle abouts each specified axis in the given order for each specified amount in degrees.
 * 
 * @param {*} axis 
 * String where each character is the axis to be rotated. 
 * Rotations applied in order characters, 'x', 'y', and 'z', appear in string.
 * 
 * @param {*} angles 
 * Array of the angles of each rotation. 
 * Each index in the array corresponds to each character in the axis string. 
 * Angles given in degrees.
 */
Triangle.prototype.rotate = function(axis, angles) {
    //check to see if the number of axis and number of angle rotations are the same
    if(angles.length != axis.length) {
        return;
    }

    //create the rotation matrices in the correct order with correct angles
    var mats = []; //the queue that determines how matricies will be applied
    for(var i = 0; i < axis.length; i++) {
        //stores the newly created rotation matrix
        var rotMat = null;
        
        //reads the string and creates a new matrix based on what it reads
        if('x' == axis.substring(i, i+1)) {         //if the character is 'x' create an x-rotation matrix
            rotMat = Mat4x4.createRotationMatrix('x', angles[i]);
        } else if ('y' == axis.substring(i, i+1)) { //if the character is 'y' create an y-rotation matrix
            rotMat = Mat4x4.createRotationMatrix('y', angles[i]);
        } else if ('z' == axis.substring(i, i+1)) { //if the character is 'z' create an z-rotation matrix
            rotMat = Mat4x4.createRotationMatrix('z', angles[i]);
        }

        //push the new matrix to the queue
        mats.push(rotMat);
    }

    //multiple them in order
    while(mats.length > 1) {
        //remove front two elements
        m1 = mats.shift();
        m2 = mats.shift();
        //multiply them
        nm = mult4x4by4x4(m1, m2);
        //put the product back in at the front
        mats.unshift(nm);
    }

    //multiply the each point by the final product
    this.a = mult1x4by4x4(this.a, mats[0]);
    this.b = mult1x4by4x4(this.b, mats[0]);
    this.c = mult1x4by4x4(this.c, mats[0]);
}

/**
 * Gets the depth of the centroid of the triangle.
 * 
 * @returns 
 * The depth of the center of the triangle.
 * 
 */
Triangle.prototype.getDepth = function() {
    return (this.a.matrix[2] + this.b.matrix[2] + this.c.matrix[2]) /  3;
}

/**
 * 
 * Creates a rectangle given furthest left X, top most Y, width, and height.
 * Top left values are truncated and bottom right values are rounded.
 * 
 * @param {*} x 
 * specifies how far to the left the rectangle starts
 * 
 * @param {*} y 
 * specifies how far down the rectangle starts
 * 
 * @param {*} width 
 * specifies the width of the rectangle
 * 
 * @param {*} height 
 * specifies the height of the rectangle
 * 
 */
function Rectangle(x, y, width, height) {
    this.points = [Math.trunc(x), Math.trunc(y), Math.round(x + width), Math.round(y + height)];
}


/**
 *      BASIC MATRIX CREATION AND EDITING
 */

/**
 * Create a new 4x4 Matrix. 
 * If 16 number array is provided then use that for the matrix.
 * Otherwise create a new empty matrix.
 * 
 * @param mat 
 * 16 number array for initializing matrix.
 * 
 */
function Mat4x4(mat) {
    //if no matrix is defined create an empty one.
    if(mat === undefined || mat.length != 16) {
        this.matrix = [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0 ];
    } else {
        this.matrix = mat;
    }
    
}

/**
 * Sets a number at a specific index [0, 15] in the matrix.
 * 
 * @param {*} index 
 * Index [0-15] to set to new value
 * 
 * @param {*} val 
 * Number that index will be set to
 * 
 */
Mat4x4.prototype.setValue = function(index, val) {
    this.matrix[index] = value;
}

/**
 * Sets 16 number matrix array to different 16 number matrix array.
 * If new array is not 16 numbers long, it does not set it.
 * 
 * @param mat 
 * 16 number long array to set new matrix to. 
 * 
 */
Mat4x4.prototype.setMatrix = function(mat) {
    //break if undefined or length is not 16.
    if(mat === undefined || mat.length != 16) {
        return;
    }

    this.matrix = mat;
}

/**
 * Creates a new 4x4 projection matrix based off of given near and far clipping planes and the field of view.
 * 
 * @param near 
 * Near clipping plane
 * 
 * @param far 
 * Far clipping plane
 * 
 * @param fov 
 * Field of view (in degrees)
 * 
 * @returns 
 * New Mat4x4 to be used as projection matrix.
 * 
 */
Mat4x4.createProjectionMatrix = function(near, far, fov) {
    let S = 1 / (Math.tan(fov / 2) * (Math.PI / 180));

    let mat = [
        S, 0, 0, 0,
        0, S, 0, 0,
        0, 0, -far/(far - near), -1,
        0, 0, -(far * near) / (far - near), 0
    ];

    let r = new Mat4x4(mat);
    return r;
}

/**
 * Creates a new 4x4 rotation matrix from specified axis and angle.
 * 
 * @param {*} axis 
 * Character that specifies which axis to create matrix for
 * 
 * @param {*} theta
 * Angle of rotation in degrees
 * 
 * @returns 
 * New Mat4x4 to be used as rotation matrix
 * 
 */
Mat4x4.createRotationMatrix = function(axis, theta) {
    //create empty array to stores matrix
    var mat = [];

    //parse the character and create matrix based off of character
    if(axis == 'x') {
        mat = [
            1, 0, 0, 0,
            0, Math.cos(toRadians(theta)), -Math.sin(toRadians(theta)), 0,
            0, Math.sin(toRadians(theta)), Math.cos(toRadians(theta)), 0,
            0, 0, 0, 1
        ];
    } else if(axis == 'y') {
        mat = [
            Math.cos(toRadians(theta)), 0, Math.sin(toRadians(theta)), 0,
            0, 1, 0, 0,
            -Math.sin(toRadians(theta)), 0, Math.cos(toRadians(theta)), 0,
            0, 0, 0, 1
        ];
    } else if(axis == 'z') {
        mat = [
            Math.cos(toRadians(theta)), -Math.sin(toRadians(theta)), 0, 0,
            Math.sin(toRadians(theta)), Math.cos(toRadians(theta)), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    //create and return new 4x4 matrix from matrix array.
    return new Mat4x4(mat);
}

/**
 * Multiples two 4x4 matrices together.
 * 
 * @param {*} mat1 
 * The first matrix factor
 * 
 * @param {*} mat2 
 * The second matrix factor
 * 
 * @returns
 * The new Mat4x4 that is the product of the two matrices.
 * 
 */
function mult4x4by4x4(mat1, mat2) {
    //get blank matrix
    var nmat = [];

    for(var i = 0; i < 4; i++) { //get row
        for(var j = 0; j < 4; j++) { //get column
            //total for 'dot' product
            var total = 0;
            for(var k = 0; k < 4; k++) { //iterate through values
                //grab values to multiply to get total
                var v1 = mat1.matrix[(i * 4) + k];
                var v2 = mat2.matrix[(j * 4) + k];

                total += v1 * v2;
            }
            //add total to matrix
            nmat.push(total);
        }
    }

    return new Mat4x4(nmat);
}

/**
 * Create a new 1x4 Matrix. 
 * If 4 number array is provided then use that for the matrix.
 * Otherwise create a new empty matrix.
 * 
 * @param mat 
 * 4 number array for initializing matrix.
 */
function Mat1x4(mat) {
    if(mat === undefined || mat.length != 4) {
        this.matrix = [0, 0, 0, 0];
    } else {
        this.matrix = mat;
    }
}

/**
 * Sets 4 number matrix array to different 4 number matrix array.
 * If new array is not 4 numbers long, it does not set it.
 * 
 * @param mat 
 * 4 number long array to set new matrix to. 
 * 
 */
Mat1x4.prototype.setMatrix = function(mat) {
    this.matrix = mat;
}

/**
 * Adds values from one 1x4 matrice to this one.
 * 
 * @param {*} mat 
 * Other matrix to add with.
 * 
 */
Mat1x4.prototype.add1x4 = function(mat) {
    this.matrix[0] += mat.matrix[0];
    this.matrix[1] += mat.matrix[1];
    this.matrix[2] += mat.matrix[2];
    this.matrix[3] += mat.matrix[3];
}

/**
 * Multiplies all numbers in a matrix by a single value.
 * 
 * @param {*} mat 
 * matrix to get multiplied.
 * 
 * @param {*} s 
 * number to multiply all values in matrix by.
 * 
 */
function multScalar(mat, s) {
    //loop through each 
    for(var i = 0; i < mat.matrix.length; i++) {
        mat.matrix[i] *= s;
    }
}

/**
 * Returns a new 1x4 matrix that is the product of a 1x4 and 4x4 matrix.
 * 
 * @param {*} m1x4 
 * 1x4 matrix factor
 * 
 * @param {*} m4x4 
 * 4x4 matrix factor
 * 
 * @returns 
 * New 1x4 matrix that is the product of both matrices.
 * 
 */
function mult1x4by4x4(m1x4, m4x4) {
    //1x4 matrix we create as product
    var n = new Mat1x4();

    //loop through values in both matrix arrays
    for(var i = 0; i < 4; i++) {
        var val = 0;
        for(var j = 0; j < 4; j++) {
            //grab the values that we want to multiply
            var q = m1x4.matrix[j];
            var w = m4x4.matrix[(i * 4) + j];
            val += q * w;
        }
        //set new matric at position to new value
        n.matrix[i] = val;
    }

    //return the new 1x4 matrix
    return n;
}

/**
 *      CODE FOR BASIC RASTERIZATION
 */

/**
 * Creates a new Application Window from the canvas
 * 
 * @param canvas canvas element required for drawing
 */
function Window3d(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
}

/**
 * Clears the canvas to specified color.
 * 
 * @param {*} color color to set the background
 */
Window3d.prototype.clearScreen = function(color) {
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = color;
    this.ctx.fill();
}

/**
 * TO BE IMPLEMENTED
 * @param {*} array 
 * @param {*} color 
 * @param {*} drawBoundingBox 
 */
Window3d.prototype.drawRasterArray = function(array, color) {
    //go through every point in the bounding box to see if it is inside of the triangle
    
}

/**
 * Creates an array of bytes that store the bits for which points are in the triangle
 * inside of the triangles bounding box. Each byte contains 8 points inside of the bounding box. 
 * 
 *  -- 1's are points in the triangle.
 * 
 *  -- 0's are points outside the triangle.
 * 
 * Memory efficient way of storing raster data for a triangle.
 * 
 * @param {*} tri 
 * triangle to get array from
 * 
 * @returns
 * array -> Uint8Array of bytes where each bit in a byte is a point inside of the bounding box
 * 
 * @returns
 * size -> how many bytes are used to store the data
 * 
 * @returns
 * boxSize -> how many bits in those bytes are being used to store the point data
 * 
 * @returns
 * bound -> the bounding rectangle for the triangle.
 * 
 */
Window3d.prototype.getRasterArray = function(tri) {
    //get the bounding box of the rectangle
    var bound = tri.getBoundingRect(); 

    //each point in the box will be a bit that we store as 1 or 0
    //so we need to know haw many bits we will store.
    var boxSize = bound.points[2] - bound.points[0] * bound.points[3] - bound.points[1];

    //find length to make byte array
    var size = (boxSize - (boxSize % 8)) / 8;   //how many "bytes" our bounding box takes up
    if(boxSize % 8 > 0) {                       //if there is any remaining values then create another byte for them
        size++;
    }

    //create a new array of bytes to store our data
    var arr = new Uint8Array(size);

    //initial index we are starting at
    var index = 0;
    //initial bit we are starting at
    var bit = 0;

    //loop through all points inside of the bounding box
    for(var x = bound.points[0]; x < bound.points[2]; x++) {
        for(var y = bound.points[1]; y < bound.points[3]; y++) {
            //get byte specified index in the array
            var byte = arr[index];

            //shift all bits over by one so we can insert new value
            byte = byte << 1;
            
            //calculate if the point we are testing is inside of our triangle
            //if it is in the triangle, set bit to 1, otherwise it will stay 0.
            if(isPointInTriangle(x, y, tri)) {
                //set the last bit, the one we made room for, to 1
                byte = byte | 1;
            }

            //set the byte at the index to our new byte
            arr[index] = byte;

            //increase what bit we are at
            bit++

            //if we reach the end of the byte
            //then we reset the bit counter 
            //and go to the next byte in the array
            if(bit == 8) {
                bit = 0;
                index++;
            }
        }
    }

    //return the array of bytes,
    //the number of bits that we are using to store the data, aka boxSize,
    //and the actual bounding box for the triangle.
    return {arr, size, boxSize, bound}
}

/**
 * Checks to see is a point in x, y space is inside of a given triangle.
 * Uses the odd-even algorithm.
 * IDK how to explain it... it just sorta... works...
 * 
 * @param {*} x 
 * x position
 * 
 * @param {*} y 
 * y position
 * 
 * @param {*} tri 
 * triangle to check
 * 
 * @returns
 * boolean on if point is in triangle
 * 
 */
function isPointInTriangle(x, y, tri) {
    let poly = tri.getMatrices();
    let num = 3;
    let i = 0;
    let j = num - 1;
    let c = false;

    for(;i < 3; i++) {
        if(((poly[i][1] > y) != (poly[j][1] > y)) && ((x < poly[i][0] + (poly[j][0] - poly[i][0]) * (y - poly[i][1]) / (poly[j][1] - poly[i][1])))) {
            c = !c;
        }
        j = i;
    }

    return c;
}


/**
 * GENERAL UTILITIES
 */

/**
 * Converts angle in degrees to radians
 * 
 * @param degrees
 * angle to be converted
 * 
 * @returns
 * angle in radians
 */
function toRadians(degrees) {
    return degrees / 180 * Math.PI;
}
