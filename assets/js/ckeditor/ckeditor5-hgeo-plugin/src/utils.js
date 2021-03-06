/**
 * Returns the element if a given view node is the HGeo element, null if not
 *
 * @param {module:engine/model/position~Position} position
 * @returns {Element|null}
 */
export function getHGeoElement( position) {

    if (!position) return null;
    //console.log('is my node HGeo ?',position,);

    // case at the beginning of paragraph
    try{
        if(+position.offset ===0 && !!position.parent.childCount && +position.parent.childCount>0){
            const firstChild = position.parent.getChild(0);
            if(firstChild.hasAttribute('data-hgeo')){
                //console.log('my node is HDate !');
                return firstChild;
            }
        }
    }
    catch(e){}

    if(!!position.parent && !!position.parent._textData && position.parent._textData.length === +position.offset){
        const ancestors = position.getAncestors();
        let ancestor = null;

        for (let i=ancestors.length-1;i>=0;i--){
            ancestor = ancestors[i];
            if(!!ancestor.nextSibling){
                if(ancestor.nextSibling.hasAttribute('data-hgeo')) return ancestor.nextSibling;
                else return null;
            }
        }
    }


    /*const ancestors = position.getAncestors();
    let ancestor = null;

    for (let i=ancestors.length-1;i>=0;i--){
        ancestor = ancestors[i];
        if(!!ancestor.nextSibling){
            if(ancestor.nextSibling.hasAttribute('data-hgeo')) return ancestor.nextSibling;
            else return null;
        }
    }*/


    /*if(!position.parent || !position.parent.nextSibling){
        // case after one containerElement (like another time or geomarker)
        const nodeAfter = position.nodeAfter;
        if(!!nodeAfter && nodeAfter.hasAttribute('data-hgeo')){
            return nodeAfter;
        }
    }
    else{
        // case at the end of some text
        const offset= position.offset;
        const length = position.parent.data?position.parent.data.length:0;

        const nextSibling = position.parent.nextSibling;

        //console.log('is my node HDate ?',position.parent,nextSibling,offset,length);

        if(+offset === +length && nextSibling.hasAttribute('data-hgeo')){
            //console.log('my node is HDate !');
            return nextSibling;
        }
    }*/

	return null;
}
