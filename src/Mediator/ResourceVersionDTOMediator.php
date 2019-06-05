<?php
/**
 * Created by PhpStorm.
 * User: ajeelomen-1
 * Date: 24/03/18
 * Time: 00:46
 */

namespace App\Mediator;

use App\DTO\ResourceVersionDTO;
use App\Entity\ResourceFile;
use App\Entity\ResourceVersion;
use App\Factory\DTOFactory;
use App\Factory\EntityFactory;
use App\Manager\File\FileRouter;
use Psr\Container\ContainerInterface;


class ResourceVersionDTOMediator extends DTOMediator
{
    const DTO_CLASS_NAME = ResourceVersionDTO::class;
    const ENTITY_CLASS_NAME = ResourceVersion::class;

    /** @var FileRouter */
    private $fileRouter;
    /**
     * ResourceVersionDTOMediator constructor.
     * @param ContainerInterface $locator
     */
    public function __construct(ContainerInterface $locator)
    {
        parent::__construct($locator);
        $this->dtoClassName = ResourceVersionDTO::class;
        $this->entityClassName = ResourceVersion::class;
        $this->groups = ['minimal','file','urlDetailThumbnail','urlMini'];
    }

    /**
     * @return array
     */
    public static function getSubscribedServices()
    {
        return [
            EntityFactory::class,
            DTOFactory::class,
            FileRouter::class
        ];
    }

    protected function mapDTOMinimalGroup()
    {
        /** @var ResourceVersion $version */
        $version = $this->entity;
        /** @var ResourceVersionDTO $dto */
        $dto = $this->dto;
        $dto
            ->setId($version->getId())
            ->setNumber($version->getNumber())
            ->setType(($version->getFile())?$version->getFile()->getType():null);
            //->addMappedGroup('minimal');
    }

    protected function mapDTOFileGroup()
    {
    }

    protected function mediateFile($mapperCommands){
        /** @var ResourceVersionDTO $dto */
        $dto = $this->dto;
        if($dto->getFile() === null){return;}

        /** @var ResourceVersion $version*/
        $version = $this->entity;

        if($version->getFile() === null){
            $version->setFile($this->locator->get(EntityFactory::class)->create(ResourceFile::class));
        }
        $resourceFile = $version->getFile();

        $truc = $dto->getFile();
        try{
            $resourceFile->setType($dto->getFile()->guessExtension())
                ->setMimeType($dto->getFile()->getMimeType())
                ->setSize($dto->getFile()->getSize());
        }
        catch(\Exception $e){
            $machin ='lol';
        }

        return $mapperCommands;
    }

    protected function mapDTOUrlDetailThumbnailGroup(){
        /** @var ResourceVersionDTO $dto */
        $dto = $this->dto;
        /** @var ResourceVersion $version*/
        $version = $this->entity;
        if($version->getId() !== null && $version->getId()>0){
            $fileRouter = $this->locator->get(fileRouter::class);
            $dto->addUrls(
                ["detailThumbnail"=>$fileRouter->getVersionRoute($version,"detail_thumbnail")]);
        }

    }

    protected function mapDTOUrlMiniGroup(){
        /** @var ResourceVersionDTO $dto */
        $dto = $this->dto;
        /** @var ResourceVersion $version*/
        $version = $this->entity;

        if($version->getId() !== null && $version->getId()>0){
            $fileRouter = $this->locator->get(fileRouter::class);
            $dto->addUrls(
                ["mini"=>$fileRouter->getVersionRoute($version,"mini")]);
        }


    }


}