<?php
/**
 * Created by PhpStorm.
 * User: ajeelomen-1
 * Date: 07/04/18
 * Time: 20:05
 */

namespace App\Serializer;

use App\DTO\EntityMutableDTO;
use App\Factory\MediatorFactory;
use App\Helper\WAOHelper;
use App\Mediator\NotAvailableGroupException;
use Doctrine\Common\Annotations\AnnotationReader;
use Doctrine\Common\Persistence\ManagerRegistry;
use Symfony\Component\Serializer\Mapping\Factory\ClassMetadataFactory;
use Symfony\Component\Serializer\Mapping\Loader\AnnotationLoader;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Exception\InvalidArgumentException;


class DTONormalizer extends HNormalizer
{
    const DTO_NS = 'App\\DTO\\';

    /**
     * @param WAOHelper $waoHelper
     * @param MediatorFactory $mediatorFactory
     * @param ManagerRegistry $doctrine
     * @param ArticleDTONormalizer $articleDTONormalizer
     * @param SimpleEntityNormalizer $simpleEntityNormalizer
     * @param ResourceDTONormalizer $resourceDTONormalizer
     * @param ResourceGeometryDTONormalizer $ResourceGeometryDTONormalizer
     * @param ArticleLinkDTONormalizer $articleLinkDTONormalizer
     * @param UserDTONormalizer $userDTONormalizer
     * @param ArticleHistoryDTONormalizer $articleHistoryDTONormalizer
     * @param PopDTONormalizer $popDTONormalizer
     */
    public function __construct(WAOHelper $waoHelper,
                                ManagerRegistry $doctrine,
                                MediatorFactory $mediatorFactory,
                                ArticleDTONormalizer $articleDTONormalizer,
                                SimpleEntityNormalizer $simpleEntityNormalizer,
                                ResourceDTONormalizer $resourceDTONormalizer,
                                ResourceGeometryDTONormalizer $ResourceGeometryDTONormalizer,
                                ArticleLinkDTONormalizer $articleLinkDTONormalizer,
                                UserDTONormalizer $userDTONormalizer,
                                ArticleHistoryDTONormalizer $articleHistoryDTONormalizer,
                                PopDTONormalizer $popDTONormalizer
                                )
    {
        $classMetadataFactory = new ClassMetadataFactory(new AnnotationLoader(new AnnotationReader()));
        $normalizers = array(
            $simpleEntityNormalizer,
            $userDTONormalizer,
            $articleDTONormalizer,
            $resourceDTONormalizer,
            $ResourceGeometryDTONormalizer,
            $articleLinkDTONormalizer,
            $articleHistoryDTONormalizer,
            $popDTONormalizer,
            new HGetSetMethodNormalizer($classMetadataFactory),
            new ObjectNormalizer($classMetadataFactory)
        );

        parent::__construct($normalizers,$waoHelper,$doctrine,$mediatorFactory);
    }

    public function supportsNormalization($data, $format = null)
    {
        return is_object($data) && strpos(get_class($data),self::DTO_NS)!=-1;
    }

    public function supportsDenormalization($data, $type, $format = null)
    {
        return true;
    }

    /**
     * @param mixed $object
     * @param array|null $groups
     * @param array $context
     * @return array
     * @throws InvalidArgumentException
     * @throws NotAvailableGroupException
     */
    public function normalize($object,$groups=null,array $context=[])
    {
        $normalization = $this->serializer->normalize($object, null, array(
                'overGroups' => $groups)
        );
        return $normalization;
    }

    /**
     * @param mixed $data
     * @param string $class
     * @param null $format
     * @param array $context
     * @return mixed
     * @throws InvalidArgumentException
     */
    public function denormalize($data, $class, $format = null, array $context = array())
    {
        // let's do it !
        $denormalization = $this->serializer->denormalize($data, $class,$format,$context);
        return $denormalization;
    }
}