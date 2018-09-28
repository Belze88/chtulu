/**
 * @package geometry.js
 * @doc geometry.js : Contains various geometry functions for hbase
 */
module.exports = {
    /**
     * @doc returns the absolute path from a custom horizontally-relative path
     * @param relPath
     * @param hScale
     * @returns {string}
     */
    hScalePath:function(relPath,hScale){
        let hasZ = (relPath.indexOf('Z') !== -1);
        let rawArrayPath = relPath.replace('M','').replace('Z','').trim().split('L');
        let arrayPath = [];
        rawArrayPath.forEach(function(element){
            arrayPath.push(element.trim().split(' '));
        });
        let absPath = 'M ';
        arrayPath.forEach(function(element){
            let relX = element[0];
            if(relX.indexOf('%') === -1){return;}
            relX = Number(relX.replace('%',''));
            let x = Math.floor(hScale(relX));
            absPath = absPath + ' ' + x + ' ' + element[1] + ' L';
        });
        absPath = absPath.substring(0,absPath.length-2).trim();
        if (hasZ) absPath = absPath + ' Z';
        return absPath;
    },
    /**
     * @doc returns the absolute path from a custom vertically-relative path
     * @param relPath
     * @param vScale
     * @returns {string}
     */
    vScalePath:function(relPath,vScale){
        let hasZ = (relPath.indexOf('Z') !== -1);
        let rawArrayPath = relPath.replace('M','').replace('Z','').trim().split('L');
        let arrayPath = [];
        rawArrayPath.forEach(function(element){
            arrayPath.push(element.trim().split(' '));
        });
        let absPath = 'M ';
        arrayPath.forEach(function(element){
            let relY = element[1];
            if(relY.indexOf('%') === -1){return;}
            relY = Number(relY.replace('%',''));
            let y = Math.floor(vScale(relY));
            absPath = absPath + ' ' + element[0] + ' ' + y + ' L';
        });
        absPath = absPath.substring(0,absPath.length-2).trim();
        if (hasZ) absPath = absPath + ' Z';
        return absPath;
    },
    /**
     * @doc returns the minimum X of a path
     * @param {string} path
     * @returns {number}
     */
    getPathMinX:function(path){

        let arrayPath = path.replace('M','').replace('Z','').trim().split('L');
        let minX = 100000;
        arrayPath.forEach(function(element){
            minX = Math.min(minX,Number(element.trim().split(' ')[0]));
        });
        return minX;
    },
    /**
     * @doc returns the maximum X of a path
     * @param {string} path
     * @returns {number}
     */
    getPathMaxX:function(path){

        let arrayPath = path.replace('M','').replace('Z','').trim().split('L');
        let maxX = 0;
        arrayPath.forEach(function(element){
            maxX = Math.max(maxX,Number(element.trim().split(' ')[0]));
        });
        return maxX;
    },
    /** @doc returns D3 points for htsChevron : takes for argument the upper point and the peak point
     * @param {Number} x1
     * @param {Number} y1
     * @param {Number} x2
     * @param {Number} y2
     * @returns {String}
     * */
    getChevronDefPoints : function(x1,y1,x2,y2){
        return ['M',x1,y1,
            'L',x2,y2,
            'L',x1,(y1 + 2*(y2-y1)),
            'L',x1+((x2-x1)/2),y2,
            'Z'].join(' ');
    },
    /** @doc returns D3 points for isocel triangle : takes for argument the upper point and the peak point
     * @param {Number} x1
     * @param {Number} y1
     * @param {Number} x2
     * @param {Number} y2
     * @returns {String}
     * */
    getTriangleDefPoints : function(x1,y1,x2,y2){
        return ['M',x1,y1,
            'L',x2,y2,
            'L',x1,(y1 + 2*(y2-y1)),
            'Z'].join(' ');
    },
    /** @doc returns D3 points for diamond : takes for argument the upper point and lower point coordinates and the ratio horizontal vs vertical
     * @param {Number} x1
     * @param {Number} y1
     * @param {Number} x2
     * @param {Number} y2
     * @param {Number} ratio
     * @returns {String}
     */
    getDiamondDefPoints : function(x1,y1,x2,y2,ratio){
        var horizontalArrow = ratio*Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
        var angle = Math.atan((x1-x2)/(y2-y1));

        var xc = x1 + (x2-x1)/2;
        var yc = y1 + (y2-y1)/2;

        var x3 = xc + 0.5*horizontalArrow * Math.cos(angle);
        var y3 = yc + 0.5*horizontalArrow * Math.sin(angle);
        var x4 = xc - 0.5*horizontalArrow * Math.cos(angle);
        var y4 = yc - 0.5*horizontalArrow * Math.sin(angle);

        return ['M',x1,y1,
            'L',x3,y3,
            'L',x2,y2,
            'L',x4,y4,
            'Z'].join(' ');
    },
    /** @doc returns D3 points for ArrowPeak : takes for argument the left upper point,the left upper peak point and the peak right point
     * @param {Number} x1
     * @param {Number} y1
     * @param {Number} x2
     * @param {Number} y2
     * @param {Number} x3
     * @param {Number} y3
     * @returns {String} */
    getArrowDefPoints : function(x1,y1,x2,y2,x3,y3){
        return ['M',x1,y1,
            'L',x2,y1,
            'L',x2,y2,
            'L',x3,y3,
            'L',x2,y2+2*(y3-y2),
            'L',x2,y1+2*(y3-y1),
            'L',x1,y1+2*(y3-y1),
            'Z'].join(' ');
    }
};

