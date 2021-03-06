<?php
namespace App\Serializer;

use Doctrine\Common\Persistence\ManagerRegistry;
use Symfony\Component\Serializer\Exception\InvalidArgumentException;
use Symfony\Component\Serializer\Normalizer\DenormalizerInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use App\Factory\HDateFactory;
use App\Util\HDate;
use App\Helper\DateHelper;
use App\Entity\DateType;

class HDateNormalizer implements NormalizerInterface,DenormalizerInterface
{
    /** @var HDateFactory */
    private $hDateFactory;
    /** @var ManagerRegistry */
    protected $doctrine;

    /**
     * @param ManagerRegistry $doctrine
     * @param HDateFactory $hDateFactory
     */
    public function __construct(ManagerRegistry $doctrine,HDateFactory $hDateFactory)
    {
        $this->doctrine = $doctrine;
        $this->hDateFactory = $hDateFactory;
    }

    public function supportsNormalization($data, $format = null)
    {
        return is_object($data) && get_class($data) === HDate::class;
    }

    public function supportsDenormalization($data, $type, $format = null)
    {
        return $type === Hdate::class ||
            (is_array($data) && isset($data['beginDate']) && isset($data['endDate']) && isset($data['type']))
            || (is_object($data) && get_class($data) === HDate::class);
    }

    /**
     * @param HDate $object
     * @param array|null $groups
     * @param array $context
     * @return array
     * @throws InvalidArgumentException
     */
    public function normalize($object,$groups=null,array $context=[])
    {
        try{
            $normalization = [
                'beginDate' => ($object->getBeginDate()->format('Y-m-d') . 'T00:00:00.000Z' ),
                'endDate' => ($object->getEndDate()->format('Y-m-d') . 'T00:00:00.000Z' ),
                'type' => $object->getType()->getId()]
            ;
        }
        catch(\Exception $e){
            throw new InvalidArgumentException("Error while normalizing object of class " .
                get_class($object) . " :  " . $e->getMessage());
        }
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
        if ($data === null) return null;
        if(is_object($data)) return $data;
        try{
            $data["beginDate"] = DateHelper::createFromJson($data["beginDate"]);
            $data["endDate"] = DateHelper::createFromJson($data["endDate"]);
            $data["type"] = $this->doctrine->getRepository(DateType::class)
                ->find(intval($data["type"]));
        }
        catch(\Exception $e){
            throw new InvalidArgumentException("Invalid argument for transformation while denormalizing to " .
                HDate::class . " :  " . $e->getMessage());
        }
        try{
            $object = $this->hDateFactory->create($data["type"],$data["beginDate"], $data["endDate"]);

        }
        catch(\Exception $e){
            throw new InvalidArgumentException("Error while denormalizing onto '" .
                HDate::class . "' object :  " . $e->getMessage());
        }
        return $object;
    }
}